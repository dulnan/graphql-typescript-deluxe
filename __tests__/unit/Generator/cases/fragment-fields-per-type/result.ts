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
 * fragment articleLink on Node {
 *   ... on Article {
 *     link {
 *       id
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type ArticleLinkFragment = (object | {
  link?: {
    id: string | number;
    label?: string;
  };
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment linkId on Node {
 *   ... on Article {
 *     link {
 *       id
 *     }
 *   }
 *   ... on Page {
 *     link @include(if: $withLink) {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type LinkIdFragment = (object | {
  link?: {
    id: string | number;
  };
});


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query articleArticleLink {
 *   article {
 *     ...articleLink
 *     link {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type ArticleArticleLinkQuery = {
  article?: {
    link?: {
      id: string | number;
      label?: string;
      url?: string;
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query articleLinkId($withLink: Boolean!) {
 *   article {
 *     ...linkId
 *     link {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type ArticleLinkIdQuery = {
  article?: {
    link?: {
      id: string | number;
      url?: string;
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query pageArticleLink {
 *   page {
 *     ...articleLink
 *     link {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type PageArticleLinkQuery = {
  page?: {
    link?: {
      url?: string;
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query pageLinkId($withLink: Boolean!) {
 *   page {
 *     ...linkId
 *     link {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type PageLinkIdQuery = {
  page?: {
    link?: {
      id?: string | number;
      url?: string;
    };
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ArticleArticleLinkQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ArticleLinkIdQueryVariables = Exact<{
  withLink: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type PageArticleLinkQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type PageLinkIdQueryVariables = Exact<{
  withLink: boolean;
}>;