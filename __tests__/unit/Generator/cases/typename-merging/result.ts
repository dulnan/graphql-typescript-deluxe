// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

/** A comment by an external user. */
type Comment = 'Comment'
/** A domain. */
type Domain = 'Domain'

type MediaImage = 'MediaImage'

type MediaVideo = 'MediaVideo'
/** A blog post. */
type NodeArticle = 'NodeArticle'

type NodePage = 'NodePage'
/** A user. */
type User = 'User'

// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Entity =
  | User
  | Domain
  | Comment
  | MediaImage
  | MediaVideo
  | NodePage
  | NodeArticle

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticle on NodeArticle {
 *   __typename
 *   tags
 * }
 * ```
 */
export type NodeArticleFragment = {
  __typename: NodeArticle
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
 * query typenameMerging {
 *   withTypename: getRandomEntity {
 *     __typename
 *     id
 *     ... on NodePage {
 *       body
 *     }
 *
 *     ... on NodeArticle {
 *       title
 *     }
 *
 *     ...nodeArticle
 *   }
 *
 *   withoutTypename: getRandomEntity {
 *     id
 *     ... on NodePage {
 *       body
 *     }
 *
 *     ... on NodeArticle {
 *       title
 *     }
 *
 *     ...nodeArticle
 *   }
 * }
 * ```
 */
export type TypenameMergingQuery = {
  /** Get random entity. */
  withTypename?:
    | {
        __typename: Exclude<Entity, NodePage | NodeArticle>
        /** The ID. */
        id: string
      }
    | {
        __typename: NodePage
        /** The body text. */
        body?: string
        /** The ID. */
        id: string
      }
    | ({
        __typename: NodeArticle
        /** The ID. */
        id: string
        /** The title of the article. */
        title: string
      } & NodeArticleFragment)
  /** Get random entity. */
  withoutTypename?:
    | {
        /** The ID. */
        id: string
      }
    | {
        /** The body text. */
        body?: string
        /** The ID. */
        id: string
      }
    | ({
        /** The ID. */
        id: string
        /** The title of the article. */
        title: string
      } & NodeArticleFragment)
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type TypenameMergingQueryVariables = object
