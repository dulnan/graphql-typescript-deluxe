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
 * query includeWithDefault($withBody: Boolean! = false) {
 *   page {
 *     title
 *     body @include(if: $withBody)
 *   }
 * }
 * ```
 */
export type IncludeWithDefaultQuery = {
  page?: {
    body?: string;
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nullableWithDefault($text: String = "news") {
 *   search(text: $text)
 * }
 * ```
 */
export type NullableWithDefaultQuery = {
  search?: (string | null)[];
};

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
  search?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query searchWithDefaults($filter: Filter, $page: Int! = 1, $text: String) {
 *   search(filter: $filter, page: $page, text: $text)
 * }
 * ```
 */
export type SearchWithDefaultsQuery = {
  search?: (string | null)[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type IncludeWithDefaultQueryVariables = Exact<{
  withBody?: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NullableWithDefaultQueryVariables = Exact<{
  text?: string | null;
}>;

/** @see {@link file://./test.graphql} */
export type RequiredFilterQueryVariables = Exact<{
  filter: Filter;
}>;

/** @see {@link file://./test.graphql} */
export type SearchWithDefaultsQueryVariables = Exact<{
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