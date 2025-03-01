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

/**
 * @see {@link ./test.graphql}
 *
 */
export type CommentsQueryVariables = object
