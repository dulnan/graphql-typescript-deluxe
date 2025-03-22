import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { format } from './../../../helpers/format'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

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

    const output = await format(
      generator.add(documents).build().getOperations('ts').getSource(),
    )

    await expect(output).toMatchFileSnapshot(
      './__snapshots__/nonOptionalTypeName.result.ts',
    )
  })
})
