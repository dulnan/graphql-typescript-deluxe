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
 * query inlineFragmentUnionIr {
 *   getCar {
 *     name
 *     ... on Vehicle {
 *       maxSpeed
 *     }
 *   }
 * }
 * ```
 */
export type InlineFragmentUnionIrQuery = {
  getCar?: {
    maxSpeed: number;
    name: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InlineFragmentUnionIrQueryVariables = Exact<{ [key: string]: never; }>;