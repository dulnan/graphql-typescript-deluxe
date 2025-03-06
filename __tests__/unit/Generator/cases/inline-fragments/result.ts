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
 * query inlineFragments {
 *   getHomepage {
 *     title
 *   }
 * }
 * ```
 */
export type InlineFragmentsQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
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
export type InlineFragmentsQueryVariables = Exact<{ [key: string]: never }>
