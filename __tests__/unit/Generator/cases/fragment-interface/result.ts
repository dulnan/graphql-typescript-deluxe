// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
 * @see {@link file://./test.graphql}
 *
 * @example
 * ```graphql
 * query fragmentInterface {
 *   getRandomEntity {
 *     ...entity
 *   }
 * }
 * ```
 */
export type FragmentInterfaceQuery = {
  /** Get random entity. */
  getRandomEntity?: EntityFragment
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 */
export type FragmentInterfaceQueryVariables = Exact<{ [key: string]: never }>
