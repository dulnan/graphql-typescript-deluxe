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
export const EntityType = Object.freeze({
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA'
} as const);
export type EntityType = 'NODE' | 'MEDIA';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthorEmail on NodeArticle {
 *   author {
 *     email
 *   }
 * }
 * ```
 */
export type ArticleAuthorEmailFragment = {
  /** The author of the article. */
  author: {
    /** Email address of the author. */
    email?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthorName on NodeArticle {
 *   author {
 *     name
 *   }
 * }
 * ```
 */
export type ArticleAuthorNameFragment = {
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
 * fragment articleTags on NodeArticle {
 *   tags
 * }
 * ```
 */
export type ArticleTagsFragment = {
  /** The tags. */
  tags?: (string | null)[];
};

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
 * fragment media on Media {
 *   entityType
 *   provider
 * }
 * ```
 */
export type MediaFragment = {
  /** The EntityType enum. */
  entityType: EntityType;
  /** The media provider. */
  provider?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeTitle on Node {
 *   title
 * }
 * ```
 */
export type NodeTitleFragment = {
  /** The title of the node. */
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment video on MediaVideo {
 *   id
 *   videoUrl
 * }
 * ```
 */
export type VideoFragment = {
  /** The ID of the media video. */
  id: string;
  /** The URL of the video (external). */
  videoUrl?: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conflict {
 *   search {
 *     ...articleAuthorName
 *     ...articleAuthorEmail
 *   }
 * }
 * ```
 */
export type ConflictQuery = {
  /** Perform a search. */
  search?: ((object | {
    /** The author of the article. */
    author: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query coverAll {
 *   search {
 *     ...entityId
 *   }
 * }
 * ```
 */
export type CoverAllQuery = {
  /** Perform a search. */
  search?: EntityIdFragment[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query coverAllWithOverlap {
 *   search {
 *     ...entityId
 *     ...video
 *   }
 * }
 * ```
 */
export type CoverAllWithOverlapQuery = {
  /** Perform a search. */
  search?: ((EntityIdFragment | EntityIdFragment & VideoFragment))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query disjointCoverAll {
 *   search {
 *     ...video
 *     ...articleTags
 *   }
 * }
 * ```
 */
export type DisjointCoverAllQuery = {
  /** Perform a search. */
  search?: ((ArticleTagsFragment | VideoFragment))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceOutsideParent {
 *   search {
 *     ...media
 *   }
 * }
 * ```
 */
export type InterfaceOutsideParentQuery = {
  /** Perform a search. */
  search?: ((MediaFragment | object))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query overlap {
 *   search {
 *     ...media
 *     ...video
 *   }
 * }
 * ```
 */
export type OverlapQuery = {
  /** Perform a search. */
  search?: ((MediaFragment & VideoFragment | object))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query severalInterfaces {
 *   getRandomEntity {
 *     ...media
 *     ...nodeTitle
 *     ...video
 *   }
 * }
 * ```
 */
export type SeveralInterfacesQuery = {
  /** Get random entity. */
  getRandomEntity?: (MediaFragment | MediaFragment & VideoFragment | NodeTitleFragment | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ConflictQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type CoverAllQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type CoverAllWithOverlapQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type DisjointCoverAllQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceOutsideParentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type OverlapQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SeveralInterfacesQueryVariables = Exact<{ [key: string]: never; }>;