// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
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
        /** The body text. */
        body?: string
        /** The ID of the page. */
        id: string
        /** The title of the node. */
        title: string
      }
    | {
        /** Categories of this article. */
        categories?: Array<{
          /** The label. */
          label: string
        }>
        /** The title of the node. */
        title: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type TestQueryVariables = object
