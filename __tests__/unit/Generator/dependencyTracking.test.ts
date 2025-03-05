import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/generator/index.js'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import type { GeneratorInput } from '../../../src/types/index.js'
import type { GeneratorOutputCode } from '../../../src/classes/GeneratorOutput'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function resultWithoutCode(items: GeneratorOutputCode[]): any[] {
  return items.map((v) => {
    return {
      type: v.type,
      name: v.name,
      filePath: v.filePath,
      dependencies: v.dependencies,
    }
  })
}

function toDocument(content: string, filePath: string): GeneratorInput {
  const documentNode = parse(content, {
    noLocation: false,
  })
  return {
    documentNode,
    filePath,
  }
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
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              {
                "type": "enum",
                "value": "EntityType",
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
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
              {
                "type": "operation",
                "value": "FoobarQuery",
              },
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              {
                "type": "operation-variables",
                "value": "FoobarQueryVariables",
              },
              {
                "type": "file",
                "value": "query.foobar.graphql",
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
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "file",
                "value": "fragment.entity.graphql",
              },
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              {
                "type": "enum",
                "value": "EntityType",
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
                "type": "enum",
                "value": "EntityType",
              },
              {
                "type": "fragment-name",
                "value": "entity",
              },
              {
                "type": "fragment",
                "value": "EntityFragment",
              },
              {
                "type": "operation",
                "value": "FoobarQuery",
              },
              {
                "type": "file",
                "value": "query.foobar.graphql",
              },
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              {
                "type": "operation-variables",
                "value": "FoobarQueryVariables",
              },
              {
                "type": "file",
                "value": "query.foobar.graphql",
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

    const result = generator.build().getOperationsFile()
    expect(result).toMatchInlineSnapshot(`
      "
      const fragment_category = \`fragment category on Category{related{...relatedEntity}}\`;
      const fragment_nodeArticle = \`fragment nodeArticle on NodeArticle{categories{...category}}\`;
      const fragment_relatedEntity = \`fragment relatedEntity on Entity{id}\`;
      const query_foobar = \`query foobar{getRandomEntity{...nodeArticle}}\`;

      export const operations = {
        query: {
          'foobar': query_foobar + fragment_relatedEntity + fragment_category + fragment_nodeArticle,
        },
        mutation: {
          
        },
        subscription: {
          
        }
      }
      "
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
    expect(generator.build().getEverything()).toMatchInlineSnapshot(`
      "// --------------------------------------------------------------------------------
      // Fragments
      // --------------------------------------------------------------------------------

      export type ArticleOneFragment = {
        /** Categories of this article. */
        categories?: Array<{
        /** The label. */
        label: string;
      }>;
        /** The title of the article. */
        title: string;
      };

      export type ArticleTwoFragment = {
        /** Categories of this article. */
        categories?: Array<{
        /** The URL for the category overview page. */
        url?: string;
      }>;
      };


      // --------------------------------------------------------------------------------
      // Operations
      // --------------------------------------------------------------------------------

      export type QueryFirstQuery = {
        /** Get random entity. */
        getRandomEntity?: (({
        /** Categories of this article. */
        categories?: Array<{
        /** The label. */
        label: string;
        /** Related entities. */
        related?: Array<({
        /** The ID. */
        id: string;
      })>;
        /** The URL for the category overview page. */
        url?: string;
      }>;
      } & Omit<ArticleOneFragment, "categories">) | object);
      };


      // --------------------------------------------------------------------------------
      // Operation Variables
      // --------------------------------------------------------------------------------

      export type QueryFirstQueryVariables = object;"
    `)

    generator.update(
      toDocument(
        `fragment articleTwo on NodeArticle { categories { urlRenamed: url } }`,
        'fragment.articleTwo.graphql',
      ),
    )

    expect(generator.build().getEverything()).toMatchInlineSnapshot(`
      "// --------------------------------------------------------------------------------
      // Fragments
      // --------------------------------------------------------------------------------

      export type ArticleOneFragment = {
        /** Categories of this article. */
        categories?: Array<{
        /** The label. */
        label: string;
      }>;
        /** The title of the article. */
        title: string;
      };

      export type ArticleTwoFragment = {
        /** Categories of this article. */
        categories?: Array<{
        /** The URL for the category overview page. */
        urlRenamed?: string;
      }>;
      };


      // --------------------------------------------------------------------------------
      // Operations
      // --------------------------------------------------------------------------------

      export type QueryFirstQuery = {
        /** Get random entity. */
        getRandomEntity?: (({
        /** Categories of this article. */
        categories?: Array<{
        /** The label. */
        label: string;
        /** Related entities. */
        related?: Array<({
        /** The ID. */
        id: string;
      })>;
        /** The URL for the category overview page. */
        urlRenamed?: string;
      }>;
      } & Omit<ArticleOneFragment, "categories">) | object);
      };


      // --------------------------------------------------------------------------------
      // Operation Variables
      // --------------------------------------------------------------------------------

      export type QueryFirstQueryVariables = object;"
    `)
  })
})
