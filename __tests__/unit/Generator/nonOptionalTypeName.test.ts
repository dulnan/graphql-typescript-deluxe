import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/generator/index.js'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import { format } from './../../../helpers/format.js'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function toDocument(content: string, filePath: string) {
  const documentNode = parse(content, {
    noLocation: false,
  })
  return {
    documentNode,
    filePath,
  }
}

describe('Generator nonOptionalTypename', () => {
  it('always adds __typename', async () => {
    const generator = new Generator(schema, {
      output: {
        nonOptionalTypename: true,
      },
    })

    const documents = [
      toDocument('fragment user on User { email }', 'fragment.user.graphql'),
      toDocument(
        `
query foobar {
  user: getRandomEntity {
    ...user
  }
  page: getRandomEntity {
    id
    ... on NodeArticle {
      categories {
        label
      }
    }
  }
}`,
        'query.foobar.graphql',
      ),
    ]

    const output = await format(generator.add(documents).build().getAll())

    await expect(output).toMatchFileSnapshot(
      './__snapshots__/nonOptionalTypeName.result.ts',
    )
  })
})
