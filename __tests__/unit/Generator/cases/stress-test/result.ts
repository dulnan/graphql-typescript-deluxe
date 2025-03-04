// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment categoryRelatedNode on Node {
 *   title
 *   ... on NodeArticle {
 *     categories {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type CategoryRelatedNodeFragment =
  | {
      /** Categories of this article. */
      categories?: Array<{
        /** The URL for the category overview page. */
        url?: string
      }>
      /** The title of the node. */
      title: string
    }
  | {
      /** The title of the node. */
      title: string
    }

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query stressTest {
 *   entityById(id: "1", entityType: NODE) {
 *     ...categoryRelatedNode
 *     ... on NodeArticle {
 *       categories {
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type StressTestQuery = {
  /** Get an entity by ID. */
  entityById?:
    | object
    | {
        /** Categories of this article. */
        categories?: Array<{
          /** The label. */
          label: string
          /** The URL for the category overview page. */
          url?: string
        }>
        /** The title of the node. */
        title: string
      }
    | {
        /** The title of the node. */
        title: string
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type StressTestQueryVariables = object
