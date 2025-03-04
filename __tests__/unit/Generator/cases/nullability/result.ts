// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nullability on Nullability {
 *   nullableId
 *   nonNullableId
 *   nullableEntity {
 *     id
 *   }
 *   nonNullableEntity {
 *     id
 *   }
 * }
 * ```
 */
export type NullabilityFragment = {
  nonNullableEntity: {
    /** The ID. */
    id: string
  }
  nonNullableId: string
  nullableEntity?: {
    /** The ID. */
    id: string
  }
  nullableId?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nullabilityQuery on Query {
 *   nullableArray {
 *     nullableId
 *     nonNullableId
 *   }
 *   nonNullableArray {
 *     nullableId
 *     nonNullableId
 *   }
 *   fullyNonNullableArray {
 *     nullableId
 *     nonNullableId
 *   }
 * }
 * ```
 */
export type NullabilityQueryFragment = {
  /** Get a non-nullable array with non-nullable items. */
  fullyNonNullableArray: Array<{
    nonNullableId: string
    nullableId?: string
  }>
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: Array<{
    nonNullableId: string
    nullableId?: string
  } | null>
  /** Get a fully nullable array. */
  nullableArray?: Array<{
    nonNullableId: string
    nullableId?: string
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
 *     nullableId
 *     nonNullableId
 *   }
 *   nonNullableArray {
 *     nullableId
 *     nonNullableId
 *   }
 *   fullyNonNullableArray {
 *     nullableId
 *     nonNullableId
 *   }
 * }
 * ```
 */
export type NullabilityQuery = {
  /** Get a non-nullable array with non-nullable items. */
  fullyNonNullableArray: Array<{
    nonNullableId: string
    nullableId?: string
  }>
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: Array<{
    nonNullableId: string
    nullableId?: string
  } | null>
  /** Get a fully nullable array. */
  nullableArray?: Array<{
    nonNullableId: string
    nullableId?: string
  } | null>
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type NullabilityQueryVariables = object
