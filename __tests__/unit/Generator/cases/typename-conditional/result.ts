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
type Query = 'Query';
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
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageBody on NodePage {
 *   body
 * }
 * ```
 */
export type PageBodyFragment = {
  /** The body text. */
  body?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageId on NodePage {
 *   __typename @include(if: $withTypename)
 *   id
 * }
 * ```
 */
export type PageIdFragment = {
  __typename?: NodePage;
  /** The ID of the page. */
  id: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageTitle on NodePage {
 *   title
 * }
 * ```
 */
export type PageTitleFragment = {
  /** The title of the page. */
  title: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstractPlusInline($withTypename: Boolean!) {
 *   getRandomEntity {
 *     __typename @include(if: $withTypename)
 *     ... on User {
 *       __typename
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type AbstractPlusInlineQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: User;
    /** The name of the user. */
    name?: string;
  } | {
    __typename?: Exclude<Entity, User>;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstract($withTypename: Boolean!) {
 *   getRandomEntity {
 *     __typename @include(if: $withTypename)
 *     id
 *   }
 * }
 * ```
 */
export type AbstractQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    __typename?: Entity;
    /** The ID. */
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstractWithBranches($withTypename: Boolean!) {
 *   getRandomEntity {
 *     __typename @include(if: $withTypename)
 *     ... on User {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type AbstractWithBranchesQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename?: Exclude<Entity, User>;
  } | {
    __typename?: User;
    /** The name of the user. */
    name?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragmentInObject($withTypename: Boolean!) {
 *   getHomepage {
 *     ...pageId
 *     title
 *   }
 * }
 * ```
 */
export type FragmentInObjectQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & PageIdFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectAlias($withTypename: Boolean!) {
 *   getHomepage {
 *     kind: __typename @include(if: $withTypename)
 *     title
 *   }
 * }
 * ```
 */
export type ObjectAliasQuery = {
  /** Get the homepage. */
  getHomepage?: {
    kind?: NodePage;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectPlusPlain($withTypename: Boolean!) {
 *   getHomepage {
 *     __typename @include(if: $withTypename)
 *     __typename
 *     title
 *   }
 * }
 * ```
 */
export type ObjectPlusPlainQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename: NodePage;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query object($withTypename: Boolean!) {
 *   getHomepage {
 *     __typename @include(if: $withTypename)
 *     title
 *   }
 * }
 * ```
 */
export type ObjectQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename?: NodePage;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectSkip($withoutTypename: Boolean!) {
 *   getHomepage {
 *     __typename @skip(if: $withoutTypename)
 *     title
 *   }
 * }
 * ```
 */
export type ObjectSkipQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename?: NodePage;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query onlyTypenameAndSpreads($withTypename: Boolean!) {
 *   getHomepage {
 *     __typename @include(if: $withTypename)
 *     ...pageTitle
 *     ...pageBody
 *   }
 * }
 * ```
 */
export type OnlyTypenameAndSpreadsQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename?: NodePage;
  } & PageTitleFragment & PageBodyFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query root($withTypename: Boolean!) {
 *   __typename @include(if: $withTypename)
 *   isAvailable
 * }
 * ```
 */
export type RootQuery = {
  __typename?: Query;
  /**
   * A very complex and long description. // Contains JS style syntax.
   * /* A full comment. *\/
   * Another line.
   * *\/ Another comment but broken /*
   * *\//*\/*\/*\/*\/*\/**\////*\/**\/*\/*\/*\//*\/*\/*\/*\/**\/*\/*\/*\/*\/*\/***\/ *\/ *\/ *\/* *\/
   */
  isAvailable?: boolean;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query union($withTypename: Boolean!) {
 *   search {
 *     __typename @include(if: $withTypename)
 *     ... on NodeArticle {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type UnionQuery = {
  /** Perform a search. */
  search?: (({
    __typename?: MediaVideo;
  } | {
    __typename?: NodeArticle;
    /** The title of the article. */
    title: string;
  }))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AbstractPlusInlineQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type AbstractQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type AbstractWithBranchesQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type FragmentInObjectQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectAliasQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectPlusPlainQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ObjectSkipQueryVariables = Exact<{
  withoutTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OnlyTypenameAndSpreadsQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type UnionQueryVariables = Exact<{
  withTypename: boolean;
}>;