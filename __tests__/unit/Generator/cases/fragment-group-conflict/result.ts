// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

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
 * fragment authorEmail on Entity {
 *   entityType
 *   ... on NodeArticle {
 *     author {
 *       email
 *     }
 *   }
 * }
 * ```
 */
export type AuthorEmailFragment = ({
  /** The EntityType enum. */
  entityType: EntityType;
} | {
  /** The author of the article. */
  author: {
    /** Email address of the author. */
    email?: string;
  };
  /** The EntityType enum. */
  entityType: EntityType;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment authorName on Entity {
 *   id
 *   ... on NodeArticle {
 *     author {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type AuthorNameFragment = ({
  /** The ID. */
  id: string;
} | {
  /** The author of the article. */
  author: {
    /** Name of the author. */
    name: string;
  };
  /** The ID. */
  id: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment authorNameNested on Entity {
 *   id
 *   ...articleAuthor
 * }
 * ```
 */
export type AuthorNameNestedFragment = ({
  /** The ID. */
  id: string;
} | {
  /** The ID. */
  id: string;
} & ArticleAuthorFragment);


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conflictNested {
 *   search {
 *     ...authorNameNested
 *     ...authorEmail
 *   }
 * }
 * ```
 */
export type ConflictNestedQuery = {
  /** Perform a search. */
  search?: (({
    /** The author of the article. */
    author?: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & DistributiveOmit<AuthorNameNestedFragment, "author"> & DistributiveOmit<AuthorEmailFragment, "author">))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conflict {
 *   search {
 *     ...authorName
 *     ...authorEmail
 *   }
 * }
 * ```
 */
export type ConflictQuery = {
  /** Perform a search. */
  search?: (({
    /** The author of the article. */
    author?: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & DistributiveOmit<AuthorNameFragment, "author"> & DistributiveOmit<AuthorEmailFragment, "author">))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ConflictNestedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ConflictQueryVariables = Exact<{ [key: string]: never; }>;