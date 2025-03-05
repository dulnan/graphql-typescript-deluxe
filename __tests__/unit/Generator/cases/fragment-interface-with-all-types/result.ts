// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment comment on Comment {
 *   author {
 *     name
 *   }
 * }
 * ```
 */
export type CommentFragment = {
  /** The author of the comment. */
  author: {
    /** Name of the author. */
    name: string
  }
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment domain on Domain {
 *   label
 * }
 * ```
 */
export type DomainFragment = {
  /** The label for the domain. */
  label: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment entity on Entity {
 *   id
 *   ...comment
 *   ...domain
 *   ...user
 *   ...mediaImage
 *   ...mediaVideo
 *   ...nodePage
 *   ...nodeArticle
 * }
 * ```
 */
export type EntityFragment =
  | ({
      /** The ID. */
      id: string
    } & CommentFragment)
  | ({
      /** The ID. */
      id: string
    } & DomainFragment)
  | ({
      /** The ID. */
      id: string
    } & MediaImageFragment)
  | ({
      /** The ID. */
      id: string
    } & MediaVideoFragment)
  | ({
      /** The ID. */
      id: string
    } & NodeArticleFragment)
  | ({
      /** The ID. */
      id: string
    } & NodePageFragment)
  | ({
      /** The ID. */
      id: string
    } & UserFragment)

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
 * fragment mediaVideo on MediaVideo {
 *   videoUrl
 * }
 * ```
 */
export type MediaVideoFragment = {
  /** The URL of the video (external). */
  videoUrl?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticle on NodeArticle {
 *   categories {
 *     label
 *   }
 * }
 * ```
 */
export type NodeArticleFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** The label. */
    label: string
  }>
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

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment user on User {
 *   name
 * }
 * ```
 */
export type UserFragment = {
  /** The name of the user. */
  name?: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query test {
 *   # Returns Entity interface
 *   getRandomEntity {
 *     ...entity
 *   }
 * }
 * ```
 */
export type TestQuery = {
  /** Get random entity. */
  getRandomEntity?: EntityFragment
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type TestQueryVariables = Exact<{ [key: string]: never }>
