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
 * fragment pageBody on Page {
 *   body @include(if: $withBody)
 * }
 * ```
 */
export type PageBodyFragment = {
  body?: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query argumentDefault($limit: Int) {
 *   search(limit: $limit)
 * }
 * ```
 */
export type ArgumentDefaultQuery = {
  search?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query directive($withBody: Boolean = false) {
 *   page {
 *     title
 *     ...pageBody
 *   }
 * }
 * ```
 */
export type DirectiveQuery = {
  page?: {
    title: string;
  } & PageBodyFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inputValues($language: String = "en", $tag: String = "news") {
 *   search(filter: { language: $language }, tags: [$tag])
 * }
 * ```
 */
export type InputValuesQuery = {
  search?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nullable($text: String = "news") {
 *   search(text: $text)
 * }
 * ```
 */
export type NullableQuery = {
  search?: (string | null)[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ArgumentDefaultQueryVariables = Exact<{
  limit?: number;
}>;

/** @see {@link file://./test.graphql} */
export type DirectiveQueryVariables = Exact<{
  withBody?: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InputValuesQueryVariables = Exact<{
  language?: string;
  tag?: string;
}>;

/** @see {@link file://./test.graphql} */
export type NullableQueryVariables = Exact<{
  text?: string | null;
}>;