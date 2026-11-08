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
 * fragment entityId on Entity {
 *   ... {
 *     id
 *   }
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
 * fragment entityIdTyped on Entity {
 *   ... on Entity {
 *     id
 *   }
 * }
 * ```
 */
export type EntityIdTypedFragment = {
  /** The ID. */
  id: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityType on Entity {
 *   entityType
 * }
 * ```
 */
export type EntityTypeFragment = {
  /** The EntityType enum. */
  entityType: EntityType;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceField {
 *   getRandomEntity {
 *     ... {
 *       id
 *       entityType
 *     }
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFieldQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title: string;
  } | {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceFieldTyped {
 *   getRandomEntity {
 *     ... on Entity {
 *       id
 *       entityType
 *     }
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFieldTypedQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title: string;
  } | {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceFieldWithSpread {
 *   getRandomEntity {
 *     id
 *     ... {
 *       ...entityType
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFieldWithSpreadQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceFieldWithSpreadTyped {
 *   getRandomEntity {
 *     id
 *     ... on Entity {
 *       ...entityType
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFieldWithSpreadTypedQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceTypenameDirect {
 *   getRandomEntity {
 *     __typename
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceTypenameDirectQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
  } | {
    __typename: NodePage;
    /** The title of the page. */
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceTypename {
 *   getRandomEntity {
 *     ... {
 *       __typename
 *     }
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceTypenameQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
  } | {
    __typename: NodePage;
    /** The title of the page. */
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceTypenameTyped {
 *   getRandomEntity {
 *     ... on Entity {
 *       __typename
 *     }
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceTypenameTypedQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
  } | {
    __typename: NodePage;
    /** The title of the page. */
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectField {
 *   getHomepage {
 *     id
 *     ... {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type ObjectFieldQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query objectFieldTyped {
 *   getHomepage {
 *     id
 *     ... on NodePage {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type ObjectFieldTypedQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootType {
 *   ... {
 *     isAvailable
 *     ... {
 *       getHomepage {
 *         title
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type RootTypeQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  };
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
 * query rootTypeTyped {
 *   ... on Query {
 *     isAvailable
 *     ... on Query {
 *       getHomepage {
 *         title
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type RootTypeTypedQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  };
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
 * query unionFieldDirect {
 *   search {
 *     __typename
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type UnionFieldDirectQuery = {
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
 * query unionField {
 *   search {
 *     ... {
 *       __typename
 *     }
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type UnionFieldQuery = {
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
 * query unionFieldTyped {
 *   search {
 *     ... on SearchResult {
 *       __typename
 *     }
 *     ... on NodeArticle {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type UnionFieldTypedQuery = {
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
export type InterfaceFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceFieldTypedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceFieldWithSpreadQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceFieldWithSpreadTypedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypenameDirectQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceTypenameTypedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ObjectFieldTypedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootTypeTypedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionFieldDirectQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type UnionFieldTypedQueryVariables = Exact<{ [key: string]: never; }>;