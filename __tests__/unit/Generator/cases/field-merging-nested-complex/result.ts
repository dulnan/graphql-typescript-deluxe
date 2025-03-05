// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

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
 * fragment nodeArticleOne on NodeArticle {
 *   categories {
 *     related {
 *       ... on NodePage {
 *         body
 *         title
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleOneFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** Related entities. */
    related?: Array<
      | object
      | {
          /** The body text. */
          body?: string
          /** The title of the page. */
          title: string
        }
    >
  }>
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodeArticleTwo on NodeArticle {
 *   categories {
 *     url
 *     # type: [Entity]
 *     related {
 *       ...related
 *       ... on NodePage {
 *         title
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleTwoFragment = {
  /** Categories of this article. */
  categories?: Array<{
    /** Related entities. */
    related?: Array<
      | {
          /** The ID. */
          id: string
          /** The title of the page. */
          title: string
        }
      | {
          /** The ID. */
          id: string
        }
    >
    /** The URL for the category overview page. */
    url?: string
  }>
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment related on Entity {
 *   id
 * }
 * ```
 */
export type RelatedFragment = {
  /** The ID. */
  id: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fieldMergingNestedComplex {
 *   entityById(id: "1", entityType: NODE) {
 *     __typename
 *     ...nodeArticleOne
 *     ...nodeArticleTwo
 *   }
 * }
 * ```
 */
export type FieldMergingNestedComplexQuery = {
  /** Get an entity by ID. */
  entityById?:
    | ({
        /** Categories of this article. */
        categories?: Array<{
          /** Related entities. */
          related?: Array<
            | {
                /** The ID. */
                id: string
              }
            | {
                /** The body text. */
                body?: string
                /** The ID. */
                id: string
                /** The title of the page. */
                title: string
              }
          >
          /** The URL for the category overview page. */
          url?: string
        }>
      } & {
        __typename: NodeArticle
      })
    | {
        __typename: Exclude<Entity, NodeArticle>
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingNestedComplexQueryVariables = Exact<{
  [key: string]: never
}>
