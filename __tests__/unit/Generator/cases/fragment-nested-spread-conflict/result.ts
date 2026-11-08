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
 * fragment articleTagIds on Article {
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type ArticleTagIdsFragment = {
  tags: ({
    id: string | number;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTags on Article {
 *   ...articleTagIds
 * }
 * ```
 */
export type ArticleTagsFragment = ArticleTagIdsFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleWithTitle on Article {
 *   title
 *   ...articleTagIds
 * }
 * ```
 */
export type ArticleWithTitleFragment = {
  title: string;
} & ArticleTagIdsFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment conditionalTagIds on Article {
 *   ...articleTagIds @include(if: $withIds)
 * }
 * ```
 */
export type ConditionalTagIdsFragment = Partial<ArticleTagIdsFragment>;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment tagLabels on Article {
 *   tags {
 *     label
 *   }
 * }
 * ```
 */
export type TagLabelsFragment = {
  tags: {
    label: string;
  }[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conditionalNestedSpread($withIds: Boolean!) {
 *   article {
 *     ...conditionalTagIds
 *     tags {
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type ConditionalNestedSpreadQuery = {
  article?: {
    tags: ({
      id?: string | number;
      label: string;
    })[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedSpreadAndFragment {
 *   article {
 *     ...articleTags
 *     ...tagLabels
 *   }
 * }
 * ```
 */
export type NestedSpreadAndFragmentQuery = {
  article?: {
    tags: ({
      id: string | number;
      label: string;
    })[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedSpread {
 *   article {
 *     ...articleTags
 *     tags {
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type NestedSpreadQuery = {
  article?: {
    tags: ({
      id: string | number;
      label: string;
    })[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedSpreadWithOtherFields {
 *   article {
 *     ...articleWithTitle
 *     tags {
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type NestedSpreadWithOtherFieldsQuery = {
  article?: ({
    tags: ({
      id: string | number;
      label: string;
    })[];
  } & Omit<ArticleWithTitleFragment, "tags">);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ConditionalNestedSpreadQueryVariables = Exact<{
  withIds: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedSpreadAndFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NestedSpreadQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NestedSpreadWithOtherFieldsQueryVariables = Exact<{ [key: string]: never; }>;