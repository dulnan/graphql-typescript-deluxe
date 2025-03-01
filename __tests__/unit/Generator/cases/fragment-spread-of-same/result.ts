// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment entity on Entity {
 *   id
 * }
 * ```
 */
export type EntityFragment = {
  /** The ID. */
  id: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query test {
 *   # Returns Entity interface
 *   getRandomEntity {
 *     ...entity
 *     # Concrete type implementing Entity
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type TestQuery = {
  /** Get random entity. */
  getRandomEntity:
    | {
        /** The ID. */
        id: string
      }
    | {
        /** The ID. */
        id: string
        /** The title of the page. */
        title: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type TestQueryVariables = object
