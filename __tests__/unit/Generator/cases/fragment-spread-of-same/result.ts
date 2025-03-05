// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

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
 *     # Object type implementing Entity
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type TestQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | {
        /** The ID. */
        id: string
        /** The title of the page. */
        title: string
      }
    | {
        /** The ID. */
        id: string
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type TestQueryVariables = Exact<{ [key: string]: never }>
