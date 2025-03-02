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
 * fragment category on Category {
 *   url
 *   label
 * }
 * ```
 */
export type CategoryFragment = {
  /** The label. */
  label: string
  /** The URL for the category overview page. */
  url?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment entity on Entity {
 *   id
 *   entityType
 * }
 * ```
 */
export type EntityFragment = {
  /** The EntityType enum. */
  entityType: EntityType
  /** The ID. */
  id: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment mediaImage on MediaImage {
 *   image
 * }
 * ```
 */
export type MediaImageFragment = {
  /** The image URL. */
  image?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticle on NodeArticle {
 *   categories {
 *     ...category
 *   }
 *
 *   tags
 * }
 * ```
 */
export type NodeArticleFragment = {
  /** Categories of this article. */
  categories?: Array<CategoryFragment>
  /** The tags. */
  tags?: Array<string | null>
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodePage on NodePage {
 *   body
 * }
 * ```
 */
export type NodePageFragment = {
  /** The body text. */
  body?: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fragmentInterface {
 *   getRandomEntity {
 *     ...entity
 *     ...nodePage
 *     ...nodeArticle
 *     ...mediaImage
 *   }
 * }
 * ```
 */
export type FragmentInterfaceQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | {
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
      }
    | ({
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
      } & MediaImageFragment)
    | ({
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
      } & NodePageFragment)
    | ({
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
      } & NodeArticleFragment)
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FragmentInterfaceQueryVariables = object
