// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Article = 'Article';
type Page = 'Page';
type Video = 'Video';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment authorEmail on Node {
 *   ... on Page {
 *     author {
 *       email
 *     }
 *   }
 *   ... on Article {
 *     author {
 *       email
 *     }
 *   }
 * }
 * ```
 */
export type AuthorEmailFragment = (object | {
  author: {
    /** The email address of the person. */
    email: string;
  };
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment authorName on Node {
 *   ... on Page {
 *     author {
 *       name
 *     }
 *   }
 *   ... on Article {
 *     id
 *     author {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type AuthorNameFragment = (object | {
  /** The author of the article. */
  author: {
    /** The name of the person. */
    name: string;
  };
  /** The ID of the article. */
  id: string | number;
} | {
  /** The author of the page. */
  author: {
    /** The name of the person. */
    name: string;
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
 * query differentDescriptions {
 *   node {
 *     __typename
 *     ... on Page {
 *       title
 *     }
 *     ... on Article {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type DifferentDescriptionsQuery = {
  node?: ({
    __typename: Article | Page;
    title: string;
  } | {
    __typename: Video;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragmentConflict {
 *   result {
 *     ...authorName
 *     ...authorEmail
 *   }
 * }
 * ```
 */
export type FragmentConflictQuery = {
  result?: ({
    author?: {
      /** The email address of the person. */
      email?: string;
      /** The name of the person. */
      name?: string;
    };
  } & DistributiveOmit<AuthorNameFragment, "author">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceField {
 *   node {
 *     __typename
 *     id
 *     ... on Page {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFieldQuery = {
  node?: ({
    __typename: Article | Video;
    /** The ID of the node. */
    id: string | number;
  } | {
    __typename: Page;
    /** The ID of the node. */
    id: string | number;
    /** The title of the page. */
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query missingDescription {
 *   node {
 *     __typename
 *     ... on Article {
 *       title
 *     }
 *     ... on Video {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type MissingDescriptionQuery = {
  node?: ({
    __typename: Article | Video;
    title: string;
  } | {
    __typename: Page;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedDescriptions {
 *   node {
 *     ... on Page {
 *       author {
 *         name
 *       }
 *     }
 *     ... on Article {
 *       author {
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedDescriptionsQuery = {
  node?: (object | {
    author: {
      /** The name of the person. */
      name: string;
    };
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query unionMembers {
 *   node {
 *     ... on Page {
 *       related {
 *         ... on PageImage {
 *           url
 *         }
 *         ... on PageLink {
 *           href
 *         }
 *       }
 *     }
 *     ... on Article {
 *       related {
 *         ... on ArticleImage {
 *           url
 *         }
 *         ... on ArticleLink {
 *           href
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type UnionMembersQuery = {
  node?: (object | {
    related: (({
      /** The target of the link. */
      href: string;
    } | {
      url: string;
    }))[];
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type DifferentDescriptionsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type FragmentConflictQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type MissingDescriptionQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NestedDescriptionsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionMembersQueryVariables = Exact<{ [key: string]: never; }>;