// --------------------------------------------------------------------------------
// Concrete Types
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
 * query typenamesComplex {
 *   one: getRandomEntity {
 *     __typename
 *     ... on NodePage {
 *       body_alias: body
 *     }
 *   }
 * }
 * ```
 */
export type TypenamesComplexQuery = {
  /** Get random entity. */
  one:
    | {
        __typename: Exclude<Entity, NodePage>
      }
    | {
        __typename: NodePage
        /** The body text. */
        body_alias?: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type TypenamesComplexQueryVariables = object
