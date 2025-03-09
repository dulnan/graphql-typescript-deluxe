import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import {
  DuplicateInputDocumentError,
  FieldNotFoundError,
  FragmentNotFoundError,
  InvalidOptionError,
  MissingRootTypeError,
  TypeNotFoundError,
  DependencyTrackingError,
  NodeLocMissingError,
} from '../../../src'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator errors', () => {
  it('Throws an InvalidOptionError', async () => {
    expect(
      () =>
        new Generator(schema, {
          output: {
            typeComment: false,
            arrayShape: 'Foobar',
          },
        }),
    ).toThrow(InvalidOptionError)
  })

  it('Throws a TypeNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on NonExistingType {
      foobar
   }
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(TypeNotFoundError)
  })

  it('Throws a FragmentNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ...nonExistingFragment
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(FragmentNotFoundError)
  })

  it('Throws a FieldNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      nonExistinfField
    }
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(FieldNotFoundError)
  })

  it('Throws a MissingRootTypeError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      nonExistinfField
    }
  }
}
`)

    // @ts-expect-error It's readonly.
    doc.documentNode.definitions[0].operation = 'nonExistingOperation'

    generator.add(doc)

    expect(() => generator.build()).toThrow(MissingRootTypeError)
  })

  it('Throws a DuplicateInputDocumentError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}
`)

    // Add the document initially.
    generator.add(doc)
    generator.build()

    // Try to add the same document again.
    expect(() => generator.add(doc)).toThrow(DuplicateInputDocumentError)
  })

  it('Throws a DependencyTrackingError', async () => {
    const generator = new Generator(schema)

    // Start a dependency tracking stack.
    // @ts-expect-error Private property.
    generator.dependencyTracker.start()

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}
`)

    generator.add(doc)

    // Will throw this error since we didn't end the dependency tracker stack.
    expect(() => generator.build()).toThrow(DependencyTrackingError)
  })

  it('Throws a NodeLocMissingError', async () => {
    const generator = new Generator(schema)

    const documentNode = parse(
      `query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}`,
      {
        noLocation: true,
      },
    )

    generator.add({ documentNode, filePath: 'test.graphql' })
    const result = generator.build()

    expect(() => result.getOperationsFile()).toThrow(NodeLocMissingError)
  })
})
