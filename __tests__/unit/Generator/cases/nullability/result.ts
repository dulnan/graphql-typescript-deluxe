// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nullability on Query {
 *   nullableArray {
 *     id
 *   }
 *   nonNullableArray {
 *     id
 *   }
 *   fullyNonNullableArray {
 *     id
 *   }
 * }
 * ```
 */
export type NullabilityFragment = {
  /** Get a non-nullable array with non-nullable items. */
  fullyNonNullableArray: Array<{
    /** The ID. */
    id: string
  }>
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: Array<{
    /** The ID. */
    id: string
  } | null>
  /** Get a fully nullable array. */
  nullableArray?: Array<{
    /** The ID. */
    id: string
  } | null>
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query nullability {
 *   nullableArray {
 *     id
 *   }
 *   nonNullableArray {
 *     id
 *   }
 *   fullyNonNullableArray {
 *     id
 *   }
 * }
 * ```
 */
export type NullabilityQuery = {
  /** Get a non-nullable array with non-nullable items. */
  fullyNonNullableArray: Array<{
    /** The ID. */
    id: string
  }>
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: Array<{
    /** The ID. */
    id: string
  } | null>
  /** Get a fully nullable array. */
  nullableArray?: Array<{
    /** The ID. */
    id: string
  } | null>
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type NullabilityQueryVariables = object
