import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/generator/index.js'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import type { GeneratedCode, GeneratorInput } from '../../../src/types/index.js'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function resultWithoutCode(items: GeneratedCode[]): any[] {
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
              "file#####fragment.user.graphql",
              "fragment-name#####user",
              "fragment#####UserFragment",
            ],
            "filePath": "fragment.user.graphql",
            "name": "UserFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              "enum#####EntityType",
              "file#####fragment.entity.graphql",
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              "enum#####EntityType",
              "file#####fragment.entity.graphql",
              "fragment-name#####entity",
              "fragment#####EntityFragment",
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              "file#####fragment.user.graphql",
              "fragment-name#####user",
              "fragment#####UserFragment",
              "file#####fragment.entity.graphql",
              "enum#####EntityType",
              "fragment-name#####entity",
              "fragment#####EntityFragment",
              "operation#####FoobarQuery",
              "file#####query.foobar.graphql",
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              "operation-variables#####FoobarQueryVariables",
              "file#####query.foobar.graphql",
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
              "file#####fragment.user.graphql",
              "fragment-name#####user",
              "fragment#####UserFragment",
            ],
            "filePath": "fragment.user.graphql",
            "name": "UserFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              "enum#####EntityType",
              "file#####fragment.entity.graphql",
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityType",
            "type": "enum",
          },
          {
            "dependencies": [
              "enum#####EntityType",
              "file#####fragment.entity.graphql",
              "fragment-name#####entity",
              "fragment#####EntityFragment",
            ],
            "filePath": "fragment.entity.graphql",
            "name": "EntityFragment",
            "type": "fragment",
          },
          {
            "dependencies": [
              "file#####fragment.user.graphql",
              "fragment-name#####user",
              "fragment#####UserFragment",
              "file#####fragment.entity.graphql",
              "enum#####EntityType",
              "fragment-name#####entity",
              "fragment#####EntityFragment",
              "operation#####FoobarQuery",
              "file#####query.foobar.graphql",
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQuery",
            "type": "operation",
          },
          {
            "dependencies": [
              "operation-variables#####FoobarQueryVariables",
              "file#####query.foobar.graphql",
            ],
            "filePath": "query.foobar.graphql",
            "name": "FoobarQueryVariables",
            "type": "operation-variables",
          },
          {
            "dependencies": [
              "file#####fragment.mediaImage.graphql",
              "fragment-name#####mediaImage",
              "fragment#####MediaImageFragment",
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

    const result = generator.build().getOperations()
    expect(result).toMatchInlineSnapshot(`
      "
      const fragment_relatedEntity = \`fragment relatedEntity on Entity{id}\`;
      const fragment_category = \`fragment category on Category{related{...relatedEntity}}\`;
      const fragment_nodeArticle = \`fragment nodeArticle on NodeArticle{categories{...category}}\`;
      const operation_query_foobar = \`query foobar{getRandomEntity{...nodeArticle}}\`;


      const query = {
        'foobar': operation_query_foobar + fragment_relatedEntity + fragment_category + fragment_nodeArticle,
      }

      const mutation = {
      }

      const subscription = {
      }

      const operations = {
        query,
        mutation,
        subscription
      }
      export { operations }
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
    expect(generator.build().getAll()).toMatchInlineSnapshot(`
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

    expect(generator.build().getAll()).toMatchInlineSnapshot(`
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
