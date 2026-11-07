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

/** A possble search result item. */
export type SearchResult = MediaVideo | NodeArticle;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleBody on NodeArticle {
 *   body
 * }
 * ```
 */
export type ArticleBodyFragment = {
  /** The body text of the article. */
  body?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTeaser on NodeArticle {
 *   body
 *   tags
 * }
 * ```
 */
export type ArticleTeaserFragment = {
  /** The body text of the article. */
  body?: string;
  /** The tags. */
  tags?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityBase on Entity {
 *   id
 *   entityType
 * }
 * ```
 */
export type EntityBaseFragment = {
  /** The EntityType enum. */
  entityType: EntityType;
  /** The ID. */
  id: string;
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
 * fragment pageTeaser on NodePage {
 *   title
 * }
 * ```
 */
export type PageTeaserFragment = {
  /** The title of the page. */
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment teaser on Node {
 *   ...articleTeaser
 *   ...pageTeaser
 * }
 * ```
 */
export type TeaserFragment = (ArticleTeaserFragment | PageTeaserFragment);

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment wrapper on Entity {
 *   ...entityBase
 * }
 * ```
 */
export type WrapperFragment = EntityBaseFragment;


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstractInlineInterface {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on Node {
 *       ...pageBody
 *     }
 *   }
 * }
 * ```
 */
export type AbstractInlineInterfaceQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
  } & PageBodyFragment);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query dispatchFragment {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ...teaser
 *   }
 * }
 * ```
 */
export type DispatchFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodeArticle | NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodeArticle;
    /** The ID. */
    id: string;
  } & ArticleTeaserFragment | {
    __typename: NodePage;
    /** The ID. */
    id: string;
  } & PageTeaserFragment);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectInlineInterfaceOtherType {
 *   getHomepage {
 *     id
 *     ... on Node {
 *       ...articleBody
 *     }
 *   }
 * }
 * ```
 */
export type ObjectInlineInterfaceOtherTypeQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectInlineInterface {
 *   getHomepage {
 *     id
 *     ... on Node {
 *       ...nodeTitle
 *     }
 *   }
 * }
 * ```
 */
export type ObjectInlineInterfaceQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the node. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query wrapperFragment {
 *   search {
 *     __typename
 *     ...wrapper
 *   }
 * }
 * ```
 */
export type WrapperFragmentQuery = {
  /** Perform a search. */
  search?: ({
    __typename: MediaVideo | NodeArticle;
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  })[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AbstractInlineInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type DispatchFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectInlineInterfaceOtherTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectInlineInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type WrapperFragmentQueryVariables = Exact<{ [key: string]: never; }>;