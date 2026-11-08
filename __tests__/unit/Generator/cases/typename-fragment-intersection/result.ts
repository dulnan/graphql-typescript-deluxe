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
 * fragment entityId on Entity {
 *   id
 * }
 * ```
 */
export type EntityIdFragment = {
  /** The ID. */
  id: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageBody on NodePage {
 *   body
 * }
 * ```
 */
export type PageBodyFragment = {
  /** The body text. */
  body?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageTitle on NodePage {
 *   title
 * }
 * ```
 */
export type PageTitleFragment = {
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
 * query abstractTwoFragments {
 *   getRandomEntity {
 *     __typename
 *     ...pageTitle
 *     ...pageBody
 *   }
 * }
 * ```
 */
export type AbstractTwoFragmentsQuery = {
  /** Get random entity. */
getRandomEntity?: ((PageTitleFragment & PageBodyFragment & { __typename: NodePage }) | {
  __typename: Exclude<Entity, NodePage>;
});
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectConditionalFragment($withTitle: Boolean!) {
 *   getHomepage {
 *     __typename
 *     ...pageTitle @include(if: $withTitle)
 *     ...pageBody
 *   }
 * }
 * ```
 */
export type ObjectConditionalFragmentQuery = {
  /** Get the homepage. */
getHomepage?: (Partial<PageTitleFragment> & PageBodyFragment & { __typename: NodePage });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectInterfaceFragment {
 *   getHomepage {
 *     __typename
 *     ...entityId
 *     ...pageTitle
 *   }
 * }
 * ```
 */
export type ObjectInterfaceFragmentQuery = {
  /** Get the homepage. */
getHomepage?: (EntityIdFragment & PageTitleFragment & { __typename: NodePage });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectTwoFragments {
 *   getHomepage {
 *     __typename
 *     ...pageTitle
 *     ...pageBody
 *   }
 * }
 * ```
 */
export type ObjectTwoFragmentsQuery = {
  /** Get the homepage. */
getHomepage?: (PageTitleFragment & PageBodyFragment & { __typename: NodePage });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AbstractTwoFragmentsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectConditionalFragmentQueryVariables = Exact<{
  withTitle: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectInterfaceFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectTwoFragmentsQueryVariables = Exact<{ [key: string]: never; }>;