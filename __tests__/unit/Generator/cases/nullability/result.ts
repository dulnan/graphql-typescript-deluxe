// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
    id: string;
  };
  nonNullableId: string;
  nullableEntity?: {
    /** The ID. */
    id: string;
  };
  nullableId?: string;
};

/**
 * @see {@link file://./test.graphql}
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
  fullyNonNullableArray: {
    nonNullableId: string;
    nullableId?: string;
  }[];
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
  /** Get a fully nullable array. */
  nullableArray?: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nullabilityFragment {
 *   ...nullabilityQuery
 * }
 * ```
 */
export type NullabilityFragmentQuery = {
  /** Get a non-nullable array with non-nullable items. */
  fullyNonNullableArray: {
    nonNullableId: string;
    nullableId?: string;
  }[];
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
  /** Get a fully nullable array. */
  nullableArray?: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
};

/**
 * @see {@link file://./test.graphql}
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
  fullyNonNullableArray: {
    nonNullableId: string;
    nullableId?: string;
  }[];
  /** Get a non-nullable array with nullable items. */
  nonNullableArray: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
  /** Get a fully nullable array. */
  nullableArray?: ({
    nonNullableId: string;
    nullableId?: string;
  } | null)[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type NullabilityFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type NullabilityQueryVariables = Exact<{ [key: string]: never; }>;