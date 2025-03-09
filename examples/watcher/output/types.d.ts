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
 * @see {@link file://./../graphql/query.fieldMerging.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleOne on NodeArticle {
 *   title
 *   tags
 *   categories {
 *     url
 *   }
 * }
 * ```
 */
export type ArticleOneFragment = {
  /** Categories of this article. */
  categories?: {
    /** The URL for the category overview page. */
    url?: string;
  }[];
  /** The tags. */
  tags?: (string | null)[];
  /** The title of the article. */
  title: string;
};

/**
 * @see {@link file://./../graphql/query.fieldMerging.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTwo on NodeArticle {
 *   title
 *   categories {
 *     label
 *   }
 * }
 * ```
 */
export type ArticleTwoFragment = {
  /** Categories of this article. */
  categories?: {
    /** The label. */
    label: string;
  }[];
  /** The title of the article. */
  title: string;
};

/**
 * @see {@link file://./../graphql/mixed.graphql}
 * 
 * @example
 * ```graphql
 * fragment category on Category {
 *   url
 *   label
 *   renamedLabel: label
 *   related {
 *     ... on NodeArticle {
 *       title
 *       tags
 *     }
 *   }
 * }
 * ```
 */
export type CategoryFragment = {
  /** The label. */
  label: string;
  /** Related entities. */
  related?: ((object | {
    /** The tags. */
    tags?: (string | null)[];
    /** The title of the article. */
    title: string;
  }))[];
  /** The label. */
  renamedLabel: string;
  /** The URL for the category overview page. */
  url?: string;
};

/**
 * @see {@link file://./../graphql/fragment.randomEntity.graphql}
 * 
 * @example
 * ```graphql
 * fragment randomEntity on Entity {
 *   id
 *   entityType
 * 
 *   ... on NodePage {
 *     title
 *     body
 *   }
 * }
 * ```
 */
export type RandomEntityFragment = ({
  /** The EntityType enum. */
  entityType: EntityType;
  /** The ID. */
  id: string;
} | {
  /** The body text. */
  body?: string;
  /** The EntityType enum. */
  entityType: EntityType;
  /** The ID. */
  id: string;
  /** The title of the page. */
  title: string;
});


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./../graphql/query.fieldMerging.graphql}
 * 
 * @example
 * ```graphql
 * query fieldMerging {
 *   getRandomEntity {
 *     __typename
 *     ...articleOne
 *     ...articleTwo
 * 
 *     ... on NodeArticle {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingQuery = {
  /** Get random entity. */
  getRandomEntity?: (({
    /** Categories of this article. */
    categories?: {
      /** The label. */
      label: string;
      /** The URL for the category overview page. */
      url?: string;
    }[];
  } & {
    __typename: NodeArticle;
    /** The ID of the article. */
    id: string;
  } & Omit<ArticleOneFragment, "categories"> & Omit<ArticleTwoFragment, "categories">) | {
    __typename: Exclude<Entity, NodeArticle>;
  });
};

/**
 * @see {@link file://./../graphql/query.loadEntity.graphql}
 * 
 * @example
 * ```graphql
 * query loadEntity {
 *   getRandomEntity {
 *     ...randomEntity
 *   }
 * }
 * ```
 */
export type LoadEntityQuery = {
  /** Get random entity. */
  getRandomEntity?: RandomEntityFragment;
};

/**
 * @see {@link file://./../graphql/mixed.graphql}
 * 
 * @example
 * ```graphql
 * query myQuery {
 *   getRandomEntity {
 *     id
 *     ... on NodeArticle {
 *       categories {
 *         label
 *         url
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type MyQueryQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    /** Categories of this article. */
    categories?: {
      /** The label. */
      label: string;
      /** The URL for the category overview page. */
      url?: string;
    }[];
    /** The ID. */
    id: string;
  } | {
    /** The ID. */
    id: string;
  });
};

/**
 * @see {@link file://./../graphql/mixed.graphql}
 * 
 * @example
 * ```graphql
 * query queryWithVariables($skipCategories: Boolean = false) {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       categories @skip(if: $skipCategories) {
 *         ...category
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type QueryWithVariablesQuery = {
  /** Get random entity. */
  getRandomEntity?: (object | {
    /** Categories of this article. */
    categories?: CategoryFragment[];
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./../graphql/query.fieldMerging.graphql}
 * 
 */
export type FieldMergingQueryVariables = Exact<{ [key: string]: never; }>;

/**
 * @see {@link file://./../graphql/query.loadEntity.graphql}
 * 
 */
export type LoadEntityQueryVariables = Exact<{ [key: string]: never; }>;

/**
 * @see {@link file://./../graphql/mixed.graphql}
 * 
 */
export type MyQueryQueryVariables = Exact<{ [key: string]: never; }>;

/**
 * @see {@link file://./../graphql/mixed.graphql}
 * 
 */
export type QueryWithVariablesQueryVariables = Exact<{
  skipCategories?: boolean | null;
}>;