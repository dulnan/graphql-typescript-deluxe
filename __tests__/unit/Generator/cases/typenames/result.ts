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
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineFields {
 *   foobar: getRandomEntity {
 *     __typename
 *     ... on NodePage {
 *       body_alias: body
 *     }
 *   }
 * 
 *   singleObject: getRandomEntity {
 *     __typename
 *     id
 *   }
 * }
 * ```
 */
export type InlineFieldsQuery = {
  /** Get random entity. */
  foobar?: ({
    __typename: Exclude<Entity, NodePage>;
  } | {
    __typename: NodePage;
    /** The body text. */
    body_alias?: string;
  });
  /** Get random entity. */
  singleObject?: {
    __typename: Entity;
    /** The ID. */
    id: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InlineFieldsQueryVariables = Exact<{ [key: string]: never; }>;