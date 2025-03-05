// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Category = 'Category'
/** A comment by an external user. */
type Comment = 'Comment'
/** A domain. */
type Domain = 'Domain'

type MediaImage = 'MediaImage'

type MediaVideo = 'MediaVideo'
/** A blog post. */
type NodeArticle = 'NodeArticle'

type NodePage = 'NodePage'

type Query = 'Query'
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
 * @see {@link fragment.user.graphql}
 *
 * @example
 * ```graphql
 * fragment user on User { email }
 * ```
 */
export type UserFragment = {
  __typename: User
  /** The email address of the user. */
  email?: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link query.foobar.graphql}
 *
 * @example
 * ```graphql
 * query foobar {
 *   user: getRandomEntity {
 *     ...user
 *   }
 *   page: getRandomEntity {
 *     id
 *     ... on NodeArticle {
 *       categories {
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FoobarQuery = {
  __typename: Query
  /** Get random entity. */
  page?:
    | {
        __typename: Exclude<Entity, NodeArticle>
        /** The ID. */
        id: string
      }
    | {
        __typename: NodeArticle
        /** Categories of this article. */
        categories?: Array<{
          __typename: Category
          /** The label. */
          label: string
        }>
        /** The ID. */
        id: string
      }
  /** Get random entity. */
  user?:
    | UserFragment
    | {
        __typename: Exclude<Entity, User>
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link query.foobar.graphql}
 *
 */
export type FoobarQueryVariables = Exact<{ [key: string]: never }>
