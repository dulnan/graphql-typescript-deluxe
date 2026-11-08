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
 * fragment entityKind on Entity {
 *   kind: __typename
 *   ... on Domain {
 *     label
 *   }
 * }
 * ```
 */
export type EntityKindFragment = ({
  kind: Domain;
  /** The label for the domain. */
  label: string;
} | {
  kind: Exclude<Entity, Domain>;
});


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineFragment {
 *   getRandomEntity {
 *     ... on User {
 *       kind: __typename
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type InlineFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: (object | {
    kind: User;
    /** The name of the user. */
    name?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceType {
 *   getRandomEntity {
 *     kind: __typename
 *     id
 *   }
 * }
 * ```
 */
export type InterfaceTypeQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    /** The ID. */
    id: string;
    kind: Entity;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceTypeWithInlineFragment {
 *   getRandomEntity {
 *     kind: __typename
 *     ... on User {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceTypeWithInlineFragmentQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    kind: Exclude<Entity, User>;
  } | {
    kind: User;
    /** The name of the user. */
    name?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceTypeWithTypename {
 *   getRandomEntity {
 *     __typename
 *     kind: __typename
 *     ... on User {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceTypeWithTypenameQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, User>;
    kind: Exclude<Entity, User>;
  } | {
    __typename: User;
    kind: User;
    /** The name of the user. */
    name?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectType {
 *   getHomepage {
 *     kind: __typename
 *     title
 *   }
 * }
 * ```
 */
export type ObjectTypeQuery = {
  /** Get the homepage. */
  getHomepage?: {
    kind: NodePage;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectTypeWithTypename {
 *   getHomepage {
 *     __typename
 *     kind: __typename
 *   }
 * }
 * ```
 */
export type ObjectTypeWithTypenameQuery = {
  /** Get the homepage. */
  getHomepage?: {
    __typename: NodePage;
    kind: NodePage;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootType {
 *   type: __typename
 *   isAvailable
 * }
 * ```
 */
export type RootTypeQuery = {
  /**
   * A very complex and long description. // Contains JS style syntax.
   * /* A full comment. *\/
   * Another line.
   * *\/ Another comment but broken /*
   * *\//*\/*\/*\/*\/*\/**\////*\/**\/*\/*\/*\//*\/*\/*\/*\/**\/*\/*\/*\/*\/*\/***\/ *\/ *\/ *\/* *\/
   */
  isAvailable?: boolean;
  type: Query;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query unionType {
 *   search {
 *     kind: __typename
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type UnionTypeQuery = {
  /** Perform a search. */
  search?: (({
    /** The body text of the article. */
    body?: string;
    kind: NodeArticle;
  } | {
    kind: MediaVideo;
  }))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InlineFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypeWithInlineFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypeWithTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectTypeWithTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionTypeQueryVariables = Exact<{ [key: string]: never; }>;