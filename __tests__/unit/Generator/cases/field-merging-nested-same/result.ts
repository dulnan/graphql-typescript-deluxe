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
 * fragment nodeArticleOne on NodeArticle {
 *   title
 *   categories {
 *     url
 *     label
 *   }
 * }
 * ```
 */
export type NodeArticleOneFragment = {
  /** Categories of this article. */
  categories?: {
    /** The label. */
    label: string;
    /** The URL for the category overview page. */
    url?: string;
  }[];
  /** The title of the article. */
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeArticleTwo on NodeArticle {
 *   tags
 *   categories {
 *     url
 *     label
 *   }
 * }
 * ```
 */
export type NodeArticleTwoFragment = {
  /** Categories of this article. */
  categories?: {
    /** The label. */
    label: string;
    /** The URL for the category overview page. */
    url?: string;
  }[];
  /** The tags. */
  tags?: (string | null)[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fieldMergingNested {
 *   entityById(id: "1", entityType: NODE) {
 *     ...nodeArticleOne
 *     ...nodeArticleTwo
 *   }
 * }
 * ```
 */
export type FieldMergingNestedQuery = {
  /** Get an entity by ID. */
  entityById?: (NodeArticleOneFragment & NodeArticleTwoFragment | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FieldMergingNestedQueryVariables = Exact<{ [key: string]: never; }>;