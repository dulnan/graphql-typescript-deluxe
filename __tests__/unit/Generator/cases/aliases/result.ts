// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodePage on NodePage {
 *   alias_title: title
 * }
 * ```
 */
export type NodePageFragment = {
  /** The title of the page. */
  alias_title: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query inlineFields {
 *   alias_getRandomEntity: getRandomEntity {
 *     alias_id: id
 *     ...nodePage
 *     ... on NodePage {
 *       alias_body: body
 *     }
 *   }
 * }
 * ```
 */
export type InlineFieldsQuery = {
  /** Get random entity. */
  alias_getRandomEntity?:
    | {
        /** The ID. */
        alias_id: string
      }
    | ({
        /** The body text. */
        alias_body?: string
        /** The ID. */
        alias_id: string
      } & NodePageFragment)
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type InlineFieldsQueryVariables = object
