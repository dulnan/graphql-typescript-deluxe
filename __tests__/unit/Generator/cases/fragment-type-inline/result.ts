// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 * @example
 * ```graphql
 * query test {
 *   getRandomEntity {
 *     ... on Node {
 *       title
 *     }
 *
 *     ... on NodePage {
 *       id
 *       body
 *     }
 *
 *     ... on NodeArticle {
 *       categories {
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type TestQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | object
    | {
        /** Categories of this article. */
        categories?: {
          /** The label. */
          label: string
        }[]
        /** The title of the node. */
        title: string
      }
    | {
        /** The body text. */
        body?: string
        /** The ID of the page. */
        id: string
        /** The title of the node. */
        title: string
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 */
export type TestQueryVariables = Exact<{ [key: string]: never }>
