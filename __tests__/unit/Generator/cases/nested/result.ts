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
 * fragment nodePage on NodePage {
 *   title
 * }
 * ```
 */
export type NodePageFragment = {
  /** The title of the page. */
  title: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query nested {
 *   # getRandomEntity: Entity
 *   getRandomEntity {
 *     # id: String!
 *     id
 *     ...nodePage
 *     # type NodeArticle implements Entity & Node
 *     ... on NodeArticle {
 *       # body: String
 *       body
 *       # categories: [Category!]
 *       categories {
 *         # label: String!
 *         label
 *         # related: [Entity!]
 *         related {
 *           id
 *           __typename
 *           ... on NodeArticle {
 *             body
 *             title
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedQuery = {
  /** Get random entity. */
  getRandomEntity:
    | {
        /** The ID. */
        id: string
      }
    | ({
        /** The ID. */
        id: string
      } & NodePageFragment)
    | {
        /** The body text of the article. */
        body?: string
        /** Categories of this article. */
        categories?: Array<{
          /** The label. */
          label: string
          /** Related entities. */
          related?: Array<
            | {
                __typename: Exclude<Entity, NodeArticle>
                /** The ID. */
                id: string
              }
            | {
                __typename: NodeArticle
                /** The body text of the article. */
                body?: string
                /** The ID. */
                id: string
                /** The title of the article. */
                title: string
              }
          >
        }>
        /** The ID. */
        id: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type NestedQueryVariables = object
