// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticleOne on NodeArticle {
 *   title
 *   categories {
 *     url
 *     label
 *   }
 * }
 * ```
 */
export type NodeArticleOneFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** The label. */
    label: string
    /** The URL for the category overview page. */
    url?: string
  }>
  /** The title of the article. */
  title: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticleTwo on NodeArticle {
 *   tags
 *   categories {
 *     url
 *     label
 *   }
 * }
 * ```
 */
export type NodeArticleTwoFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** The label. */
    label: string
    /** The URL for the category overview page. */
    url?: string
  }>
  /** The tags. */
  tags?: Array<string | null>
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fieldMergingNested {
 *   entityById(id: "1", entityType: NODE) {
 *     ...nodeArticleOne
 *     ...nodeArticleTwo
 *   }
 * }
 * ```
 */
export type FieldMergingNestedQuery = {
  /** Get an entity by ID. */
  entityById?: object | (NodeArticleOneFragment & NodeArticleTwoFragment)
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingNestedQueryVariables = object
