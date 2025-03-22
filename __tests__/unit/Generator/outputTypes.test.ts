import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator Output Types', () => {
  it('Generates a d.ts and js file for enums', async () => {
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

    const resultJs = result.buildFile('js', ['enum']).getSource()
    expect(resultJs, 'Generates valid JavaScript exporting the enum.')
      .toMatchInlineSnapshot(`
        "// --------------------------------------------------------------------------------
        // Enums
        // --------------------------------------------------------------------------------

        export const EntityType = Object.freeze({
          /** A node. */
          NODE: 'NODE',
          /** A media. */
          MEDIA: 'MEDIA'
        });"
      `)

    const resultDts = result.buildFile('d.ts', ['enum']).getSource()
    expect(
      resultDts,
      'Generates a valid .d.ts file containing a const declaration and a string type',
    ).toMatchInlineSnapshot(`
      "// --------------------------------------------------------------------------------
      // Enums
      // --------------------------------------------------------------------------------

      export declare const EntityType: Readonly<{
        /** A node. */
        readonly NODE: 'NODE',
        /** A media. */
        readonly MEDIA: 'MEDIA'
      }>;
      export type EntityType = 'NODE' | 'MEDIA';"
    `)

    const resultTs = result.buildFile('ts', ['enum']).getSource()
    expect(
      resultTs,
      'Generates a valid .ts file containing a const export and a string type',
    ).toMatchInlineSnapshot(`
      "// --------------------------------------------------------------------------------
      // Enums
      // --------------------------------------------------------------------------------

      export const EntityType = Object.freeze({
        /** A node. */
        NODE: 'NODE',
        /** A media. */
        MEDIA: 'MEDIA'
      } as const);
      export type EntityType = 'NODE' | 'MEDIA';"
    `)
  })
})
