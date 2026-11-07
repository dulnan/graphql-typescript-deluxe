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

/** A possble search result item. */
export type SearchResult = MediaVideo | NodeArticle;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityInfo on Entity {
 *   __typename
 *   id
 *   ... on NodePage {
 *     body
 *   }
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type EntityInfoFragment = ({
  __typename: Exclude<Entity, NodePage | User>;
  /** The ID. */
  id: string;
} | {
  __typename: NodePage;
  /** The body text. */
  body?: string;
  /** The ID. */
  id: string;
} | {
  __typename: User;
  /** The ID. */
  id: string;
  /** The name of the user. */
  name?: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchResultInfo on SearchResult {
 *   __typename
 *   ... on NodeArticle {
 *     body
 *   }
 *   ... on MediaVideo {
 *     videoUrl
 *   }
 * }
 * ```
 */
export type SearchResultInfoFragment = ({
  __typename: MediaVideo;
  /** The URL of the video (external). */
  videoUrl?: string;
} | {
  __typename: NodeArticle;
  /** The body text of the article. */
  body?: string;
});


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceFragment {
 *   getHomepage {
 *     title
 *     ...entityInfo
 *   }
 * }
 * ```
 */
export type InterfaceFragmentQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename: NodePage;
    /** The title of the page. */
    title: string;
  } & EntityInfoFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query unionFragment {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       title
 *       ...searchResultInfo
 *     }
 *   }
 * }
 * ```
 */
export type UnionFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: (object | {
    __typename: NodeArticle;
    /** The title of the article. */
    title: string;
  } & SearchResultInfoFragment);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InterfaceFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionFragmentQueryVariables = Exact<{ [key: string]: never; }>;