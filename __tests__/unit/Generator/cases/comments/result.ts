// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query comments {
 *   isAvailable
 * }
 * ```
 */
export type CommentsQuery = {
  /** A very complex and long description. // Contains JS style syntax.
/* A full comment. *\/
Another line.
*\/ Another comment but broken /*
*\//*\/*\/*\/*\/*\/**\////*\/**\/*\/*\/*\//*\/*\/*\/*\/**\/*\/*\/*\/*\/*\/***\/ *\/ *\/ *\/* *\/ */
  isAvailable?: boolean
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type CommentsQueryVariables = Exact<{ [key: string]: never }>
