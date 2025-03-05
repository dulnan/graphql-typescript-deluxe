// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type MediaVideo = 'MediaVideo'
/** A blog post. */
type NodeArticle = 'NodeArticle'

// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

/** A possble search result item. */
export type SearchResult = MediaVideo | NodeArticle

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query unionTypes {
 *   search {
 *     __typename
 *
 *     ... on Node {
 *       title
 *     }
 *
 *     ... on NodeArticle {
 *       body
 *     }
 *
 *     ... on MediaVideo {
 *       videoUrl
 *     }
 *   }
 * }
 * ```
 */
export type UnionTypesQuery = {
  /** Perform a search. */
  search?: Array<
    | {
        __typename: MediaVideo
        /** The URL of the video (external). */
        videoUrl?: string
      }
    | {
        __typename: NodeArticle
        /** The body text of the article. */
        body?: string
        /** The title of the node. */
        title: string
      }
  >
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type UnionTypesQueryVariables = Exact<{ [key: string]: never }>
