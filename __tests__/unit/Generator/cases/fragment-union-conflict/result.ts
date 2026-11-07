// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

/** A blog post. */
type NodeArticle = 'NodeArticle';
type NodePage = 'NodePage';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Node = NodeArticle | NodePage;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthor on NodeArticle {
 *   tags
 *   author {
 *     email
 *   }
 * }
 * ```
 */
export type ArticleAuthorFragment = {
  /** The author of the article. */
  author: {
    /** Email address of the author. */
    email?: string;
  };
  /** The tags. */
  tags?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthorWithNodeBody on NodeArticle {
 *   author {
 *     email
 *   }
 *   ...nodeBody
 * }
 * ```
 */
export type ArticleAuthorWithNodeBodyFragment = {
  /** The author of the article. */
  author: {
    /** Email address of the author. */
    email?: string;
  };
} & NodeBodyFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeAuthor on Node {
 *   __typename
 *   ... on NodeArticle {
 *     tags
 *     author {
 *       email
 *     }
 *   }
 *   ... on NodePage {
 *     body
 *   }
 * }
 * ```
 */
export type NodeAuthorFragment = ({
  __typename: NodeArticle;
  /** The author of the article. */
  author: {
    /** Email address of the author. */
    email?: string;
  };
  /** The tags. */
  tags?: (string | null)[];
} | {
  __typename: NodePage;
  /** The body text. */
  body?: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeBody on Node {
 *   ... on NodeArticle {
 *     tags
 *   }
 *   ... on NodePage {
 *     body
 *   }
 * }
 * ```
 */
export type NodeBodyFragment = ({
  /** The body text. */
  body?: string;
} | {
  /** The tags. */
  tags?: (string | null)[];
});


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conditionalUnionFragment($withAuthor: Boolean!) {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       author {
 *         name
 *       }
 *       ...nodeAuthor @include(if: $withAuthor)
 *     }
 *   }
 * }
 * ```
 */
export type ConditionalUnionFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: (({
    /** The author of the article. */
    author: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & Partial<DistributiveOmit<NodeAuthorFragment, "author">>) | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectFragment {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       author {
 *         name
 *       }
 *       ...articleAuthor
 *     }
 *   }
 * }
 * ```
 */
export type ObjectFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: (({
    /** The author of the article. */
    author: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & Omit<ArticleAuthorFragment, "author">) | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectFragmentWithUnion {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       author {
 *         name
 *       }
 *       ...articleAuthorWithNodeBody
 *     }
 *   }
 * }
 * ```
 */
export type ObjectFragmentWithUnionQuery = {
  /** Get random entity. */
  getRandomEntity?: (({
    /** The author of the article. */
    author: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & DistributiveOmit<ArticleAuthorWithNodeBodyFragment, "author">) | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query unionFragment {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       author {
 *         name
 *       }
 *       ...nodeAuthor
 *     }
 *   }
 * }
 * ```
 */
export type UnionFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: (({
    /** The author of the article. */
    author: {
      /** Email address of the author. */
      email?: string;
      /** Name of the author. */
      name: string;
    };
  } & {
    __typename: NodeArticle;
  } & DistributiveOmit<NodeAuthorFragment, "author">) | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ConditionalUnionFragmentQueryVariables = Exact<{
  withAuthor: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectFragmentWithUnionQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionFragmentQueryVariables = Exact<{ [key: string]: never; }>;