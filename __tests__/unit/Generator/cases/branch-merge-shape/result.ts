// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Article = 'Article';
type Company = 'Company';
type Page = 'Page';
type Person = 'Person';
type Video = 'Video';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Node = Article | Company | Page | Person | Video;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment authorId on Node {
 *   id
 * }
 * ```
 */
export type AuthorIdFragment = {
  id: string | number;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query includeInOneBranch($withTitle: Boolean!) {
 *   node {
 *     __typename
 *     ... on Article {
 *       title
 *     }
 *     ... on Page {
 *       title @include(if: $withTitle)
 *     }
 *   }
 * }
 * ```
 */
export type IncludeInOneBranchQuery = {
  node?: ({
    __typename: Article;
    title: string;
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedAliasedTypename {
 *   node {
 *     __typename
 *     ... on Article {
 *       author {
 *         kind: __typename
 *       }
 *     }
 *     ... on Page {
 *       author {
 *         kind: __typename
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedAliasedTypenameQuery = {
  node?: ({
    __typename: Article;
    author?: {
      kind: Person;
    };
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    author?: {
      kind: Company;
    };
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedConditionalSpread($withId: Boolean!) {
 *   node {
 *     __typename
 *     ... on Article {
 *       author {
 *         ...authorId
 *       }
 *     }
 *     ... on Page {
 *       author {
 *         ...authorId @include(if: $withId)
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedConditionalSpreadQuery = {
  node?: ({
    __typename: Article;
    author?: AuthorIdFragment;
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    author?: Partial<AuthorIdFragment>;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedInclude($withId: Boolean!) {
 *   node {
 *     __typename
 *     ... on Article {
 *       author {
 *         id
 *       }
 *     }
 *     ... on Page {
 *       author {
 *         id @include(if: $withId)
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedIncludeQuery = {
  node?: ({
    __typename: Article;
    author?: {
      id: string | number;
    };
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    author?: {
      id?: string | number;
    };
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedTypename {
 *   node {
 *     __typename
 *     ... on Article {
 *       author {
 *         __typename
 *         name
 *       }
 *     }
 *     ... on Page {
 *       author {
 *         __typename
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedTypenameQuery = {
  node?: ({
    __typename: Article;
    author?: {
      __typename: Person;
      name?: string;
    };
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    author?: {
      __typename: Company;
      name?: string;
    };
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedUnion {
 *   node {
 *     __typename
 *     ... on Article {
 *       related {
 *         __typename
 *         ... on Article {
 *           title
 *         }
 *       }
 *     }
 *     ... on Page {
 *       related {
 *         __typename
 *         ... on Page {
 *           title
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedUnionQuery = {
  node?: ({
    __typename: Article;
    related?: ({
      __typename: Article;
      title: string;
    } | {
      __typename: Exclude<Node, Article>;
    });
  } | {
    __typename: Exclude<Node, Article | Page>;
  } | {
    __typename: Page;
    related?: ({
      __typename: Exclude<Node, Page>;
    } | {
      __typename: Page;
      title: string;
    });
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nullableOrConditional($withName: Boolean!) {
 *   node {
 *     __typename
 *     ... on Article {
 *       author {
 *         name
 *       }
 *     }
 *     ... on Page {
 *       author {
 *         name @include(if: $withName)
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NullableOrConditionalQuery = {
  node?: ({
    __typename: Article | Page;
    author?: {
      name?: string;
    };
  } | {
    __typename: Exclude<Node, Article | Page>;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query sameShape {
 *   node {
 *     __typename
 *     ... on Article {
 *       title
 *       author {
 *         name
 *       }
 *     }
 *     ... on Page {
 *       title
 *       author {
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type SameShapeQuery = {
  node?: ({
    __typename: Article | Page;
    author?: {
      name?: string;
    };
    title: string;
  } | {
    __typename: Exclude<Node, Article | Page>;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type IncludeInOneBranchQueryVariables = Exact<{
  withTitle: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedAliasedTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NestedConditionalSpreadQueryVariables = Exact<{
  withId: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedIncludeQueryVariables = Exact<{
  withId: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NestedUnionQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NullableOrConditionalQueryVariables = Exact<{
  withName: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SameShapeQueryVariables = Exact<{ [key: string]: never; }>;