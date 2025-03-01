// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fragmentInterface {
 *   withFragment: getNonNullEntity {
 *     ... on Entity {
 *       id
 *     }
 *   }
 *
 *   withoutFragment: getNonNullEntity {
 *     id
 *   }
 * }
 * ```
 */
export type FragmentInterfaceQuery = {
  /** Always get an entity. */
  withFragment: {
    /** The ID. */
    id: string
  }
  /** Always get an entity. */
  withoutFragment: {
    /** The ID. */
    id: string
  }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FragmentInterfaceQueryVariables = object
