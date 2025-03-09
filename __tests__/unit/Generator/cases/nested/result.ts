// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

/** A comment by an external user. */
type Comment = 'Comment';
/** A domain. */
type Domain = 'Domain';

type MediaImage = 'MediaImage';

type MediaVideo = 'MediaVideo';
/** A blog post. */
type NodeArticle = 'NodeArticle';

type NodePage = 'NodePage';
/** A user. */
type User = 'User';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------


export type Entity = 
  | Comment
  | Domain
  | MediaImage
  | MediaVideo
  | NodeArticle
  | NodePage
  | User;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
  title: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
  getRandomEntity?: ({
    /** The ID. */
    id: string;
  } | {
    /** The ID. */
    id: string;
  } & NodePageFragment | {
    /** The body text of the article. */
    body?: string;
    /** Categories of this article. */
    categories?: ({
      /** The label. */
      label: string;
      /** Related entities. */
      related?: (({
        __typename: Exclude<Entity, NodeArticle>;
        /** The ID. */
        id: string;
      } | {
        __typename: NodeArticle;
        /** The body text of the article. */
        body?: string;
        /** The ID. */
        id: string;
        /** The title of the article. */
        title: string;
      }))[];
    })[];
    /** The ID. */
    id: string;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type NestedQueryVariables = Exact<{ [key: string]: never; }>;