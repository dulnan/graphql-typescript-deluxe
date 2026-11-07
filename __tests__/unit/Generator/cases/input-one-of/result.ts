// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

type OneOf<T> = { [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never } }[keyof T];


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query entities($by: [EntityBy!], $filter: Filter) {
 *   entities(by: $by, filter: $filter)
 * }
 * ```
 */
export type EntitiesQuery = {
  entities?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query entity($by: EntityBy!) {
 *   entity(by: $by)
 * }
 * ```
 */
export type EntityQuery = {
  entity?: string;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type EntitiesQueryVariables = Exact<{
  by?: EntityBy[] | null;
  filter?: Filter | null;
}>;

/** @see {@link file://./test.graphql} */
export type EntityQueryVariables = Exact<{
  by: EntityBy;
}>;


// --------------------------------------------------------------------------------
// Input Types
// --------------------------------------------------------------------------------

/**
 * Load an entity by exactly one of the fields.
 * 
 * @example
 * ```graphql
 * """
 * Load an entity by exactly one of the fields.
 * """
 * input EntityBy @oneOf {
 *   """
 *   The ID.
 *   """
 *   id: ID
 * 
 *   """
 *   The path.
 *   """
 *   path: String
 * 
 *   filter: Filter
 * }
 * ```
 */
export type EntityBy = OneOf<{
  filter: Filter;
  /** The ID. */
  id: string | number;
  /** The path. */
  path: string;
}>;

/**
 * @example
 * ```graphql
 * input Filter {
 *   language: String
 *   by: EntityBy
 * }
 * ```
 */
export type Filter = {
  by?: EntityBy | null;
  language?: string | null;
};