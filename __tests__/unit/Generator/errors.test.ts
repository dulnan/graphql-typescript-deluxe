import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import {
  DuplicateDefinitionError,
  DuplicateInputDocumentError,
  FragmentCycleError,
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

  describe('DuplicateDefinitionError', () => {
    const query = `query foobar { entityById(id: "1", entityType: NODE) { ...page } }`

    it('throws for a fragment name defined in two files', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument('fragment page on NodePage { title }', 'b.graphql'),
        toDocument(query, 'query.graphql'),
      ])

      expect(() => generator.build()).toThrow(
        'The fragment name "page" is defined twice in "a.graphql" and "b.graphql"',
      )
      expect(() => generator.build()).toThrow(DuplicateDefinitionError)
    })

    it('throws for an operation name defined in two files', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('query foobar { isAvailable }', 'a.graphql'),
        toDocument('mutation foobar { __typename }', 'b.graphql'),
      ])

      expect(() => generator.build()).toThrow(
        'The operation name "foobar" is defined twice in "a.graphql" and "b.graphql"',
      )
    })

    it('throws for an operation name defined twice in the same file', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query foobar { isAvailable } query foobar { isAvailable }'),
      )

      expect(() => generator.build()).toThrow(
        'The operation name "foobar" is defined twice in "test.graphql"',
      )
    })

    it('throws when a file with the same name is added later', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      generator.build()

      generator.add(toDocument('fragment page on NodePage { id }', 'b.graphql'))
      expect(() => generator.build()).toThrow(DuplicateDefinitionError)

      generator.remove('b.graphql')
      expect(generator.build().getCollectedOperations()).toHaveLength(1)
    })

    it('does not throw while a fragment is moved to another file', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument('fragment other on NodePage { id }', 'b.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      generator.build()

      // Both files are updated before the next build.
      generator.update(
        toDocument('fragment page on NodePage { title }', 'b.graphql'),
      )
      generator.update(
        toDocument('fragment other on NodePage { id }', 'a.graphql'),
      )

      const fragment = generator
        .build()
        .getFragments()
        .find((v) => v.node.name.value === 'page')
      expect(fragment?.filePath).toBe('b.graphql')
    })
  })

  describe('FragmentCycleError', () => {
    it.each([
      [
        'a fragment that spreads itself',
        'fragment a on NodePage { title ...a }',
        'a -> a',
      ],
      [
        'two fragments that spread each other',
        'fragment a on NodePage { title ...b } fragment b on NodePage { ...a }',
        'a -> b -> a',
      ],
      [
        'a cycle in an inline fragment on an abstract type',
        'fragment a on Entity { id ... on NodePage { ...a } }',
        'a -> a',
      ],
      [
        'a cycle on the root type',
        'fragment a on Query { isAvailable ...b } fragment b on Query { ...a }',
        'a -> b -> a',
      ],
      [
        'a conditional spread',
        'fragment a on NodePage { title ...a @include(if: true) }',
        'a -> a',
      ],
    ])('throws for %s', (_, content, cycle) => {
      for (const useCache of [true, false]) {
        const generator = new Generator(schema, { useCache })
        generator.add(toDocument(content))
        expect(() => generator.build()).toThrow(
          `The fragment "a" spreads itself: ${cycle}`,
        )
      }
    })

    it('throws when the fragment is first used in an operation', () => {
      const generator = new Generator(schema, { skipUnusedFragments: true })
      generator.add(
        toDocument(`
fragment a on NodePage { title ...b }
fragment b on NodePage { ...c }
fragment c on NodePage { ...a }
query foobar { entityById(id: "1", entityType: NODE) { ...b } }
`),
      )

      expect(() => generator.build()).toThrow(FragmentCycleError)
      expect(() => generator.build()).toThrow('b -> c -> a -> b')
    })

    it('builds again once the cycle is removed', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment a on NodePage { title ...b }', 'a.graphql'),
        toDocument('fragment b on NodePage { ...a }', 'b.graphql'),
      ])
      expect(() => generator.build()).toThrow(FragmentCycleError)

      generator.update(toDocument('fragment b on NodePage { id }', 'b.graphql'))
      expect(generator.build().getFragments()).toHaveLength(2)
    })
  })
})
