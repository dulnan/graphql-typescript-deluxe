import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import type { GeneratorInput } from '../../../src/types'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function toDocument(content: string, filePath: string): GeneratorInput {
  const documentNode = parse(content, {
    noLocation: false,
  })
  return {
    documentNode,
    filePath,
  }
}

describe('Generator Output Files', () => {
  it('Returns file dependencies for enums', async () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    const documents = [
      toDocument('fragment user on User { email }', 'fragment.user.graphql'),
      toDocument(
        'fragment entity on Entity { id, entityType }',
        'fragment.entity.graphql',
      ),
      toDocument(
        `
query foobar {
  getRandomEntity {
    ...user
    ...entity
  }
}`,
        'query.foobar.graphql',
      ),
    ]

    const result = generator.add(documents).build()

    const resultTypes = result.getTypes()

    expect(
      resultTypes.getTypeScriptEnumDependencies(),
      'Should contain exactly one enum.',
    ).toEqual(['EntityType'])

    const resultEverything = result.getEverything()
    expect(
      resultEverything.getTypeScriptEnumDependencies(),
      'Should be empty since enums are included in the file.',
    ).toEqual([])
  })

  it('Returns file dependencies for fragments', async () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    const documents = [
      toDocument('fragment user on User { email }', 'fragment.user.graphql'),
      toDocument(
        'fragment entity on Entity { id, entityType }',
        'fragment.entity.graphql',
      ),
      toDocument(
        `
query foobar {
  getRandomEntity {
    ...user
    ...entity
  }
}`,
        'query.foobar.graphql',
      ),
    ]

    const result = generator.add(documents).build()

    const resultOperations = result.buildFile(['operation'])

    expect(resultOperations.getSource()).toMatchInlineSnapshot(`
      "// --------------------------------------------------------------------------------
      // Operations
      // --------------------------------------------------------------------------------

      export type FoobarQuery = {
        getRandomEntity?: ({
          entityType: EntityType;
          id: string;
        } | {
          entityType: EntityType;
          id: string;
        } & UserFragment);
      };"
    `)

    expect(
      resultOperations.getDependencies('fragment'),
      'Should contain two fragments since they were not included in the output.',
    ).toEqual([
      {
        type: 'fragment',
        value: 'UserFragment',
      },
      {
        type: 'fragment',
        value: 'EntityFragment',
      },
    ])

    expect(
      resultOperations.getDependencies('operation-variables'),
      'Should contain one operation variables type.',
    ).toEqual([
      {
        type: 'operation-variables',
        value: 'FoobarQueryVariables',
      },
    ])

    const resultEverything = result.getEverything().getDependencies('fragment')
    expect(
      resultEverything,
      'Should be empty because all code types are included.',
    ).toEqual([])
  })
})
