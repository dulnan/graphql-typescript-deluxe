// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * enum EntityType {
 *   """
 *   A node.
 *   """
 *   NODE
 * 
 *   """
 *   A media.
 *   """
 *   MEDIA
 * }
 * ```
 */
export const EntityType = {
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA'
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];


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
 *     label
 *     related {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleOneFragment = {
  /** Categories of this article. */
  categories?: {
    /** The label. */
    label: string;
    /** Related entities. */
    related?: {
      /** The ID. */
      id: string;
    }[];
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
 *     related {
 *       entityType
 *     }
 *   }
 * }
 * ```
 */
export type NodeArticleTwoFragment = {
  /** Categories of this article. */
  categories?: {
    /** Related entities. */
    related?: {
      /** The EntityType enum. */
      entityType: EntityType;
    }[];
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
 * 
 *     ... on NodeArticle {
 *       categories {
 *         related {
 *           id
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingNestedQuery = {
  /** Get an entity by ID. */
  entityById?: (({
    /** Categories of this article. */
    categories?: {
      /** The label. */
      label: string;
      /** Related entities. */
      related?: {
        /** The EntityType enum. */
        entityType: EntityType;
        /** The ID. */
        id: string;
      }[];
      /** The URL for the category overview page. */
      url?: string;
    }[];
  } & Omit<NodeArticleOneFragment, "categories"> & Omit<NodeArticleTwoFragment, "categories">) | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FieldMergingNestedQueryVariables = Exact<{ [key: string]: never; }>;