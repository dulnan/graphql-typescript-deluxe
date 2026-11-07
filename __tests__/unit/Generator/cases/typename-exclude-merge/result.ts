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
 * query redundantAndOtherInlineFragment {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on User {
 *       id
 *     }
 *     ... on Domain {
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type RedundantAndOtherInlineFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Domain;
    /** The ID. */
    id: string;
    /** The label for the domain. */
    label: string;
  } | {
    __typename: Exclude<Entity, Domain>;
    /** The ID. */
    id: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query redundantInlineFragment {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on User {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type RedundantInlineFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    __typename: Entity;
    /** The ID. */
    id: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type RedundantAndOtherInlineFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RedundantInlineFragmentQueryVariables = Exact<{ [key: string]: never; }>;