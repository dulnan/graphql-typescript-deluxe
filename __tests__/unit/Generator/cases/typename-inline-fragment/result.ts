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

export type Media = MediaImage | MediaVideo;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityTypename on Entity {
 *   __typename
 * }
 * ```
 */
export type EntityTypenameFragment = {
  __typename: Entity;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conditionalDirect($withTypename: Boolean!) {
 *   search {
 *     __typename @include(if: $withTypename)
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type ConditionalDirectQuery = {
  /** Perform a search. */
  search?: (({
    __typename?: MediaVideo;
  } | {
    __typename?: NodeArticle;
    /** The body text of the article. */
    body?: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conditionalOnParent($withTypename: Boolean!) {
 *   search {
 *     ... on SearchResult @include(if: $withTypename) {
 *       __typename
 *     }
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type ConditionalOnParentQuery = {
  /** Perform a search. */
  search?: (({
    __typename?: MediaVideo;
  } | {
    __typename?: NodeArticle;
    /** The body text of the article. */
    body?: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query direct {
 *   search {
 *     __typename
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type DirectQuery = {
  /** Perform a search. */
  search?: (({
    __typename: MediaVideo;
  } | {
    __typename: NodeArticle;
    /** The body text of the article. */
    body?: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragmentOnOtherInterface {
 *   search {
 *     ...entityTypename
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type FragmentOnOtherInterfaceQuery = {
  /** Perform a search. */
  search?: (({
    __typename: MediaVideo;
  } | {
    __typename: NodeArticle;
    /** The body text of the article. */
    body?: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectWithInterface {
 *   getHomepage {
 *     ... on Entity {
 *       __typename
 *     }
 *   }
 * }
 * ```
 */
export type ObjectWithInterfaceQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename: NodePage;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query onInterfaceGroup {
 *   getRandomEntity {
 *     __typename
 *     ... on Media {
 *       provider
 *     }
 *   }
 * }
 * ```
 */
export type OnInterfaceGroupQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, MediaImage | MediaVideo>;
  } | {
    __typename: Media;
    /** The media provider. */
    provider?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query onInterfaceWithSubtype {
 *   getRandomEntity {
 *     ... on Media {
 *       __typename
 *     }
 *     ... on MediaImage {
 *       image
 *     }
 *   }
 * }
 * ```
 */
export type OnInterfaceWithSubtypeQuery = {
  /** Get random entity. */
  getRandomEntity?: (object | {
    __typename: MediaImage;
    /** The image URL. */
    image?: string;
  } | {
    __typename: MediaVideo;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query onOtherInterface {
 *   search {
 *     ... on Entity {
 *       __typename
 *     }
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type OnOtherInterfaceQuery = {
  /** Perform a search. */
  search?: (({
    __typename: MediaVideo;
  } | {
    __typename: NodeArticle;
    /** The body text of the article. */
    body?: string;
  }))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ConditionalDirectQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type ConditionalOnParentQueryVariables = Exact<{
  withTypename: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type DirectQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type FragmentOnOtherInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectWithInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type OnInterfaceGroupQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type OnInterfaceWithSubtypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type OnOtherInterfaceQueryVariables = Exact<{ [key: string]: never; }>;