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
 * mutation doIt {
 *   doIt
 * }
 * ```
 */
export type DoItMutation = {
  doIt?: boolean;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query getThing($id: ID!) {
 *   thing(id: $id)
 * }
 * ```
 */
export type GetThingQuery = {
  thing?: string;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type DoItMutationVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type GetThingQueryVariables = Exact<{
  id: string | number;
}>;