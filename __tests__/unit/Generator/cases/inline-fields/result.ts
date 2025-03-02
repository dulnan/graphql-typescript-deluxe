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
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query inlineFields {
 *   getRandomEntity {
 *     id
 *     __typename
 *     ... on NodePage {
 *       body
 *       deprecatedTitle
 *     }
 *   }
 * }
 * ```
 */
export type InlineFieldsQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | {
        __typename: Exclude<Entity, NodePage>
        /** The ID. */
        id: string
      }
    | {
        __typename: NodePage
        /** The body text. */
        body?: string
        /** Legacy title (do not use). */
        deprecatedTitle?: string
        /** The ID. */
        id: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type InlineFieldsQueryVariables = object
