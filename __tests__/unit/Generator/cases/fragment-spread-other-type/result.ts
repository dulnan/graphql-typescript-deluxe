// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthor on NodeArticle {
 *   author {
 *     name
 *   }
 * }
 * ```
 */
export type ArticleAuthorFragment = {
  /** The author of the article. */
  author: {
    /** Name of the author. */
    name: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityWithAuthor on Entity {
 *   id
 *   ...articleAuthor
 * }
 * ```
 */
export type EntityWithAuthorFragment = ({
  /** The ID. */
  id: string;
} | {
  /** The ID. */
  id: string;
} & ArticleAuthorFragment);


// --------------------------------------------------------------------------------
// Fragments by Type
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityWithAuthor on Entity {
 *   id
 *   ...articleAuthor
 * }
 * ```
 */
export type EntityWithAuthorFragmentOnMediaVideo = {
  /** The ID of the media video. */
  id: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityWithAuthor on Entity {
 *   id
 *   ...articleAuthor
 * }
 * ```
 */
export type EntityWithAuthorFragmentOnNodeArticle = {
  /** The ID of the article. */
  id: string;
} & ArticleAuthorFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityWithAuthor on Entity {
 *   id
 *   ...articleAuthor
 * }
 * ```
 */
export type EntityWithAuthorFragmentOnNodePage = {
  /** The ID of the page. */
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
 * query page {
 *   getHomepage {
 *     ...entityWithAuthor
 *   }
 * }
 * ```
 */
export type PageQuery = {
  /** Get the homepage. */
  getHomepage?: EntityWithAuthorFragmentOnNodePage;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query pageWithField {
 *   getHomepage {
 *     title
 *     ...entityWithAuthor
 *   }
 * }
 * ```
 */
export type PageWithFieldQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & EntityWithAuthorFragmentOnNodePage;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query searchArticle {
 *   search {
 *     ... on NodeArticle {
 *       ...entityWithAuthor
 *     }
 *   }
 * }
 * ```
 */
export type SearchArticleQuery = {
  /** Perform a search. */
  search?: ((EntityWithAuthorFragmentOnNodeArticle | object))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query searchVideo {
 *   search {
 *     ... on MediaVideo {
 *       ...entityWithAuthor
 *     }
 *   }
 * }
 * ```
 */
export type SearchVideoQuery = {
  /** Perform a search. */
  search?: ((EntityWithAuthorFragmentOnMediaVideo | object))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type PageQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type PageWithFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SearchArticleQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SearchVideoQueryVariables = Exact<{ [key: string]: never; }>;