// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

type Maybe<T> = T | null;


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type NodePage = 'NodePage';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment maybe on NodePage {
 *   body
 * }
 * ```
 */
export type MaybeFragment = {
  /** The body text. */
  body: Maybe<string>;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment NodePage on NodePage {
 *   __typename
 *   title
 * }
 * ```
 */
export type NodePageFragment = {
  __typename: NodePage;
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
 * query codeKeyCollisions {
 *   getHomepage {
 *     ...NodePage
 *     ...maybe
 *   }
 * }
 * ```
 */
export type CodeKeyCollisionsQuery = {
  /** Get the homepage. */
  getHomepage: Maybe<NodePageFragment & MaybeFragment>;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type CodeKeyCollisionsQueryVariables = Exact<{ [key: string]: never; }>;