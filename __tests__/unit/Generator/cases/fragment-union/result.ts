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
 * fragment media on Media {
 *   provider
 * }
 * ```
 */
export type MediaFragment = {
  /** The media provider. */
  provider?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment node on Node {
 *   title
 * }
 * ```
 */
export type NodeFragment = {
  /** The title of the node. */
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
 * query fragmentUnion {
 *   getNonNullEntity {
 *     __typename
 *     ...node
 *     ...media
 * 
 *     ... on NodePage {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type FragmentUnionQuery = {
  /** Always get an entity. */
  getNonNullEntity: ({
    __typename: Comment | Domain | User;
  } | {
    __typename: MediaImage | MediaVideo;
    /** The media provider. */
    provider?: string;
  } | {
    __typename: NodeArticle;
    /** The title of the node. */
    title: string;
  } | {
    __typename: NodePage;
    /** The body text. */
    body?: string;
    /** The title of the node. */
    title: string;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type FragmentUnionQueryVariables = Exact<{ [key: string]: never; }>;