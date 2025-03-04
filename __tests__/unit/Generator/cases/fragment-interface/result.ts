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
 * @see {@link ./test.graphql}
 *
 */
export type FragmentInterfaceQueryVariables = object
