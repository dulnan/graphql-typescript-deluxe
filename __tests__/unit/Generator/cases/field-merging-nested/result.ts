// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * enum EntityType {
 *   """
 *   A node.
 *   """
 *   NODE
 *
 *   """
 *   A media.
 *   """
 *   MEDIA
 * }
 * ```
 */
export const EntityType = {
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA',
} as const
export type EntityType = (typeof EntityType)[keyof typeof EntityType]

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
 *     label
 *     related {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleOneFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** The label. */
    label: string
    /** Related entities. */
    related?: Array<{
      /** The ID. */
      id: string
    }>
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
 *     related {
 *       entityType
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleTwoFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** Related entities. */
    related?: Array<{
      /** The EntityType enum. */
      entityType: EntityType
    }>
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
 *
 *     ... on NodeArticle {
 *       categories {
 *         related {
 *           id
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingNestedQuery = {
  /** Get an entity by ID. */
  entityById:
    | object
    | (Omit<NodeArticleOneFragment, 'categories'> &
        Omit<NodeArticleTwoFragment, 'categories'> & {
          categories?: Array<{
            /** The label. */
            label: string
            related?: Array<{
              /** The EntityType enum. */
              entityType: EntityType
              id: string
            }>
            /** The URL for the category overview page. */
            url?: string
          }>
        })
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingNestedQueryVariables = object
