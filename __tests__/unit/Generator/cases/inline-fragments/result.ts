// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
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
 * @see {@link ./test.graphql}
 *
 */
export type InlineFragmentsQueryVariables = object
