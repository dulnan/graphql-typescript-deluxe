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
 * query requiredFilter($filter: Filter!) {
 *   search(filter: $filter)
 * }
 * ```
 */
export type RequiredFilterQuery = {
  search: (string | null)[] | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query search($filter: Filter, $text: String, $page: Int! = 1) {
 *   search(filter: $filter, text: $text, page: $page)
 * }
 * ```
 */
export type SearchQuery = {
  search: (string | null)[] | null;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type RequiredFilterQueryVariables = Exact<{
  filter: Filter;
}>;

/** @see {@link file://./test.graphql} */
export type SearchQueryVariables = Exact<{
  filter?: Filter | null;
  page?: number;
  text?: string | null;
}>;


// --------------------------------------------------------------------------------
// Input Types
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * input Filter {
 *   """
 *   Required, with a default.
 *   """
 *   language: String! = "en"
 * 
 *   """
 *   Nullable, without a default.
 *   """
 *   limit: Int
 * 
 *   """
 *   A required list, with a default.
 *   """
 *   tags: [String!]! = []
 * 
 *   """
 *   Nullable, with a default.
 *   """
 *   sort: String = "title"
 * 
 *   nested: Filter
 * }
 * ```
 */
export type Filter = {
  /** Required, with a default. */
  language?: string;
  /** Nullable, without a default. */
  limit?: number | null;
  nested?: Filter | null;
  /** Nullable, with a default. */
  sort?: string | null;
  /** A required list, with a default. */
  tags?: string[];
};