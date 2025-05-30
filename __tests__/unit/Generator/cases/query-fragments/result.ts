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
 * fragment queryOne on Query {
 *   getRandomEntity {
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type QueryOneFragment = {
  /** Get random entity. */
  getRandomEntity?: (object | {
    /** The title of the page. */
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment queryTwo on Query {
 *   getRandomEntity {
 *     __typename
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type QueryTwoFragment = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodeArticle>;
  } | {
    __typename: NodeArticle;
    /** The body text of the article. */
    body?: string;
  });
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query queryFragments {
 *   getRandomEntity {
 *     id
 *   }
 *   ...queryOne
 *   ...queryTwo
 * }
 * ```
 */
export type QueryFragmentsQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodeArticle | NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodeArticle;
    /** The body text of the article. */
    body?: string;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title: string;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type QueryFragmentsQueryVariables = Exact<{ [key: string]: never; }>;