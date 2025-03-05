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
 * query defaultValues(
 *   # The text.
 *   $text: String
 *   # The bundle.
 *   $bundle: String
 *   # The required bundle.
 *   $bundleRequired: String!
 * ) {
 *   searchContent(text: $text, bundle: $bundle, bundleRequired: $bundleRequired) {
 *     title
 *   }
 * }
 * ```
 */
export type DefaultValuesQuery = {
  /** With default values. */
  searchContent?: Array<{
    /** The title of the node. */
    title: string
  } | null>
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type DefaultValuesQueryVariables = Exact<{
  bundle?: string | null
  bundleRequired: string
  text?: string | null
}>
