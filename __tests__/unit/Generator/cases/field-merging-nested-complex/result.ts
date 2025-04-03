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
  categories?: ({
    /** Related entities. */
    related?: ((object | {
      /** The body text. */
      body?: string;
      /** The title of the page. */
      title: string;
    }))[];
  })[];
};

/**
 * @see {@link file://./test.graphql}
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
  categories?: ({
    /** Related entities. */
    related?: (({
      /** The ID. */
      id: string;
      /** The title of the page. */
      title: string;
    } | {
      /** The ID. */
      id: string;
    }))[];
    /** The URL for the category overview page. */
    url?: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
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
  id: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
entityById?: ((NodeArticleOneFragment & { __typename: NodeArticle }) | (NodeArticleTwoFragment & { __typename: NodeArticle }) | {
  __typename: Exclude<Entity, NodeArticle>;
});
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FieldMergingNestedComplexQueryVariables = Exact<{ [key: string]: never; }>;