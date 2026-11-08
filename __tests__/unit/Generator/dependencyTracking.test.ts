import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import type { GeneratorOutputCode } from '../../../src/classes/GeneratorOutputCode'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function resultWithoutCode(items: readonly GeneratorOutputCode[]): any[] {
  return items.map((v) => {
    return {
      type: v.type,
      name: v.name,
      filePath: v.filePath,
      dependencies: v.getDependencies(),
    }
  })
}

describe('Generator Depdency Tracking', () => {
  it('tracks file origin', async () => {
    const generator = new Generator(schema)

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

    generator.add(documents)

    expect(resultWithoutCode(generator.build().getGeneratedCode()))
      .toMatchInlineSnapshot(`
        [
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.user.graphql",
              },
              {
                "type": "fragment-name",
                "value": "user",
              },
              {
                "type": "fragment",
                "value": "UserFragment",
              },
            ],
            "filePath": "fragment.user.graphql",
            "name": "UserFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "file",
                "value": "fragment.user.graphql",
              },
              {
                "type": "fragment-name",
                "value": "user",
              },
              {
                "type": "fragment",
                "value": "UserFragment",
              },
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
              {
                "type": "operation",
                "value": "FoobarQuery",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "type-helpers",
                "value": "Exact",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "Exact",
            "type": "type-helpers",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "type-helpers",
                "value": "Exact",
              },
              {
                "type": "operation-variables",
                "value": "FoobarQueryVariables",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQueryVariables",
            "type": "operation-variables",
          },
        ]
      `)

    generator.add(
      toDocument(
        `
fragment mediaImage on MediaImage {
  image
}
`,
        'fragment.mediaImage.graphql',
      ),
    )

    expect(resultWithoutCode(generator.build().getGeneratedCode()))
      .toMatchInlineSnapshot(`
        [
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.user.graphql",
              },
              {
                "type": "fragment-name",
                "value": "user",
              },
              {
                "type": "fragment",
                "value": "UserFragment",
              },
            ],
            "filePath": "fragment.user.graphql",
            "name": "UserFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "file",
                "value": "fragment.user.graphql",
              },
              {
                "type": "fragment-name",
                "value": "user",
              },
              {
                "type": "fragment",
                "value": "UserFragment",
              },
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
              {
                "type": "operation",
                "value": "FoobarQuery",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "type-helpers",
                "value": "Exact",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "Exact",
            "type": "type-helpers",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
              {
                "type": "type-helpers",
                "value": "Exact",
              },
              {
                "type": "operation-variables",
                "value": "FoobarQueryVariables",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQueryVariables",
            "type": "operation-variables",
          },
          {
            "dependencies": [
              {
                "type": "file",
                "value": "fragment.mediaImage.graphql",
              },
              {
                "type": "fragment-name",
                "value": "mediaImage",
              },
              {
                "type": "fragment",
                "value": "MediaImageFragment",
              },
            ],
            "filePath": "fragment.mediaImage.graphql",
            "name": "MediaImageFragment",
            "type": "fragment",
          },
        ]
      `)
  })

  it.each([
    [
      'on its type',
      'fragment page on NodeArticle { categories { label } }',
      'fragment page on NodeArticle { categories { label related { id } } }',
    ],
    [
      'on an interface',
      'fragment page on Entity { ... on NodeArticle { categories { label } } }',
      'fragment page on Entity { ... on NodeArticle { categories { label related { id } } } }',
    ],
  ])(
    'updates a field merged with a fragment %s after the fragment changes, with useCache',
    (_, fragment, updated) => {
      const query = `query foobar {
  getRandomEntity {
    ... on NodeArticle { ...page categories { url } }
  }
}`
      const generator = new Generator(schema, { useCache: true })
      generator.add([
        toDocument(fragment, 'fragment.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      generator.build()
      generator.update(toDocument(updated, 'fragment.graphql'))

      const fresh = new Generator(schema, { useCache: true })
      fresh.add([
        toDocument(updated, 'fragment.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      const source = generator.build().getOperations('ts').getSource()
      expect(source).toEqual(fresh.build().getOperations('ts').getSource())
      expect(source).toContain('related?:')
    },
  )

  it.each([
    [
      'the nested fragment',
      'fragment.nested.graphql',
      'fragment nested on NodeArticle { categories { label related { id } } }',
    ],
    [
      'the outer fragment',
      'fragment.outer.graphql',
      'fragment outer on NodeArticle { ...nested categories { related { id } } }',
    ],
  ])(
    'updates a conflict with a field of a nested spread when %s changes',
    (_, filePath, updated) => {
      const files: Record<string, string> = {
        'fragment.nested.graphql':
          'fragment nested on NodeArticle { categories { label } }',
        'fragment.outer.graphql': 'fragment outer on NodeArticle { ...nested }',
        'query.graphql': `query foobar {
  getRandomEntity {
    ... on NodeArticle { ...outer categories { url } }
  }
}`,
      }
      const generator = new Generator(schema, { useCache: true })
      generator.add(Object.entries(files).map(([k, v]) => toDocument(v, k)))
      generator.build()
      generator.update(toDocument(updated, filePath))

      const fresh = new Generator(schema, { useCache: true })
      fresh.add(
        Object.entries({ ...files, [filePath]: updated }).map(([k, v]) =>
          toDocument(v, k),
        ),
      )
      const source = generator.build().getOperations('ts').getSource()
      expect(source).toEqual(fresh.build().getOperations('ts').getSource())
      expect(source).toContain('related?:')
    },
  )

  it('names the fragments of the operations file the same after an update', () => {
    const author = 'fragment author on Author { name }'
    const category = 'fragment category on Category { label }'
    const query = `query foobar {
  getRandomEntity {
    ... on NodeArticle { author { ...author } categories { ...category } }
  }
}`
    const generator = new Generator(schema)
    generator.add([
      toDocument(author, 'fragment.author.graphql'),
      toDocument(category, 'fragment.category.graphql'),
      toDocument(query, 'query.graphql'),
    ])
    generator.build()

    // The updated fragment is now generated after the other one.
    const updated = 'fragment author on Author { name email }'
    generator.update(toDocument(updated, 'fragment.author.graphql'))

    const fresh = new Generator(schema)
    fresh.add([
      toDocument(updated, 'fragment.author.graphql'),
      toDocument(category, 'fragment.category.graphql'),
      toDocument(query, 'query.graphql'),
    ])
    expect(generator.build().getOperationsFile().getSource()).toEqual(
      fresh.build().getOperationsFile().getSource(),
    )
  })

  it('tracks fragment references', async () => {
    const generator = new Generator(schema)

    const documents = [
      toDocument(
        'fragment nodeArticle on NodeArticle { categories { ...category } }',
        'fragment.article.graphql',
      ),
      toDocument(
        'fragment category on Category { related { ...relatedEntity } }',
        'fragment.category.graphql',
      ),
      toDocument(
        'fragment relatedEntity on Entity { id }',
        'fragment.relatedEntity.graphql',
      ),
      toDocument(
        `
query foobar {
  getRandomEntity {
    ...nodeArticle
  }
}`,
        'query.foobar.graphql',
      ),
    ]

    generator.add(documents)

    const result = generator.build()
    expect(result.getOperationsFile()).toMatchInlineSnapshot(`
      GeneratorOutputFile {
        "dependencyStrings": [],
        "mappedDependencies": null,
        "source": "const a = String.raw\`fragment category on Category{related{...relatedEntity}}\`;
      const b = String.raw\`fragment nodeArticle on NodeArticle{categories{...category}}\`;
      const c = String.raw\`fragment relatedEntity on Entity{id}\`;

      export const operations = {
        query: {
          'foobar': String.raw\`query foobar{getRandomEntity{...nodeArticle}}\` + a + b + c,
        },
        mutation: {
          
        },
        subscription: {
          
        }
      }",
        "type": "js",
      }
    `)

    expect(result.getOperationTypesFile()).toMatchInlineSnapshot(`
      GeneratorOutputFile {
        "dependencyStrings": [
          "operation#####FoobarQuery",
          "operation-variables#####FoobarQueryVariables",
        ],
        "mappedDependencies": null,
        "source": "export type Query = {
        foobar: {
          response: FoobarQuery,
          variables: FoobarQueryVariables,
          needsVariables: false
        }
      }

      export type Mutation = {}

      export type Subscription = {}

      export type Operations = {
        query: Query,
        mutation: Mutation,
        subscription: Subscription,
      }",
        "type": "ts",
      }
    `)
  })

  it('handles updates correctly', async () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    const articleOne = toDocument(
      `fragment articleOne on NodeArticle { title, categories { label } }`,
      'fragment.articleOne.graphql',
    )

    const articleTwo = toDocument(
      `fragment articleTwo on NodeArticle { categories { url } }`,
      'fragment.articleTwo.graphql',
    )

    const queryFirst = toDocument(
      `query queryFirst {
  getRandomEntity {
    ...articleOne
    ...articleTwo
    ... on NodeArticle {
      categories {
        related {
          id
        }
      }
    }
}
}`,
      'query.queryFirst.graphql',
    )

    const documents = [articleOne, articleTwo, queryFirst]

    generator.add(documents)
    expect(generator.build().getOperations('ts').getSource())
      .toMatchInlineSnapshot(`
        "// --------------------------------------------------------------------------------
        // Type Helpers
        // --------------------------------------------------------------------------------

        type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


        // --------------------------------------------------------------------------------
        // Fragments
        // --------------------------------------------------------------------------------

        export type ArticleOneFragment = {
          categories?: {
            label: string;
          }[];
          title: string;
        };

        export type ArticleTwoFragment = {
          categories?: {
            url?: string;
          }[];
        };


        // --------------------------------------------------------------------------------
        // Operations
        // --------------------------------------------------------------------------------

        export type QueryFirstQuery = {
          getRandomEntity?: (({
            categories?: {
              label: string;
              related?: {
                id: string;
              }[];
              url?: string;
            }[];
          } & Omit<ArticleOneFragment, "categories">) | object);
        };


        // --------------------------------------------------------------------------------
        // Operation Variables
        // --------------------------------------------------------------------------------

        export type QueryFirstQueryVariables = Exact<{ [key: string]: never; }>;"
      `)

    generator.update(
      toDocument(
        `fragment articleTwo on NodeArticle { categories { urlRenamed: url } }`,
        'fragment.articleTwo.graphql',
      ),
    )

    expect(generator.build().getOperations('ts').getSource())
      .toMatchInlineSnapshot(`
        "// --------------------------------------------------------------------------------
        // Type Helpers
        // --------------------------------------------------------------------------------

        type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


        // --------------------------------------------------------------------------------
        // Fragments
        // --------------------------------------------------------------------------------

        export type ArticleOneFragment = {
          categories?: {
            label: string;
          }[];
          title: string;
        };

        export type ArticleTwoFragment = {
          categories?: {
            urlRenamed?: string;
          }[];
        };


        // --------------------------------------------------------------------------------
        // Operations
        // --------------------------------------------------------------------------------

        export type QueryFirstQuery = {
          getRandomEntity?: (({
            categories?: {
              label: string;
              related?: {
                id: string;
              }[];
              urlRenamed?: string;
            }[];
          } & Omit<ArticleOneFragment, "categories">) | object);
        };


        // --------------------------------------------------------------------------------
        // Operation Variables
        // --------------------------------------------------------------------------------

        export type QueryFirstQueryVariables = Exact<{ [key: string]: never; }>;"
      `)
  })

  it('handles updates correctly for fragment updates', async () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    const articleOne = toDocument(
      `fragment articleOne on NodeArticle { title, categories { label } }`,
      'fragment.articleOne.graphql',
    )

    const articleTwo = toDocument(
      `fragment articleTwo on NodeArticle { categories { url } }`,
      'fragment.articleTwo.graphql',
    )

    const queryFirst = toDocument(
      `query queryFirst {
  getRandomEntity {
    ...articleOne
    ...articleTwo
    ... on NodeArticle {
      categories {
        related {
          id
        }
      }
    }
}
}`,
      'query.queryFirst.graphql',
    )

    const documents = [queryFirst, articleOne, articleTwo]

    generator.add(documents)
    generator.update(
      toDocument(
        `fragment articleTwo on NodeArticle { categories { urlRenamed: url } }`,
        'fragment.articleTwo.graphql',
      ),
    )

    expect(generator.build().getOperations('ts').getSource()).toContain(
      'urlRenamed',
    )
  })

  it('updates the variables type when a fragment uses a variable differently', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        'fragment pageBody on NodePage { body }',
        'fragment.pageBody.graphql',
      ),
      toDocument(
        'query homepage($withBody: Boolean = false) { getHomepage { ...pageBody } }',
        'query.homepage.graphql',
      ),
    ])
    const getVariablesType = (): string | undefined =>
      generator
        .build()
        .getOperations('ts')
        .getSource()
        .match(/export type HomepageQueryVariables = Exact<\{\n(.*)\n/)?.[1]
        ?.trim()

    expect(getVariablesType()).toEqual('withBody?: boolean | null;')

    // Now the variable is used where a non-null value is required.
    generator.update(
      toDocument(
        'fragment pageBody on NodePage { body @include(if: $withBody) }',
        'fragment.pageBody.graphql',
      ),
    )
    expect(getVariablesType()).toEqual('withBody?: boolean;')
  })

  describe('a fragment generated while generating another file', () => {
    const documents = [
      toDocument('fragment page on NodePage { title }', 'fragments.graphql'),
      toDocument(
        'query one { getHomepage { ...page } } query two { isAvailable }',
        'operations.graphql',
      ),
    ]

    it('attributes later operations to their own file', () => {
      const generator = new Generator(schema, { skipUnusedFragments: true })
      const output = generator.add(documents).build()

      expect(
        output.getCollectedOperations().map((v) => [v.graphqlName, v.filePath]),
      ).toEqual([
        ['one', 'operations.graphql'],
        ['two', 'operations.graphql'],
      ])
      expect(
        output.getGeneratedCode().map((v) => [v.type, v.name, v.filePath]),
      ).toContainEqual(['fragment', 'PageFragment', 'fragments.graphql'])
    })

    it('removes operations and unused fragments from the output', () => {
      const generator = new Generator(schema, { skipUnusedFragments: true })
      generator.add(documents).build()

      generator.update(
        toDocument(
          'query one { getHomepage { ...page } } query three { isAvailable }',
          'operations.graphql',
        ),
      )
      expect(
        generator
          .build()
          .getCollectedOperations()
          .map((v) => v.graphqlName),
      ).toEqual(['one', 'three'])

      generator.remove('operations.graphql')
      const output = generator.build()
      expect(output.getCollectedOperations()).toEqual([])
      // The fragment is not used anymore.
      expect(output.getGeneratedCode().map((v) => v.name)).toEqual([])
    })
  })
})
