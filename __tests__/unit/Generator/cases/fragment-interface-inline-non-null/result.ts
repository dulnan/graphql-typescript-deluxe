// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
    id: string;
  };
  /** Always get an entity. */
  withoutFragment: {
    /** The ID. */
    id: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type FragmentInterfaceQueryVariables = Exact<{ [key: string]: never; }>;