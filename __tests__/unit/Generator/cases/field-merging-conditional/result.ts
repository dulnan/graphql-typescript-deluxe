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


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageFields on NodePage {
 *   id
 *   title @include(if: $a)
 *   title @include(if: $b)
 * }
 * ```
 */
export type PageFieldsFragment = {
  /** The ID of the page. */
  id: string;
  /** The title of the page. */
  title?: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstractType($a: Boolean!, $b: Boolean!) {
 *   getNonNullEntity {
 *     id @include(if: $a)
 *     ... on NodePage {
 *       id @include(if: $b)
 *       title
 *     }
 *     ... on User {
 *       id
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type AbstractTypeQuery = {
  /** Always get an entity. */
  getNonNullEntity: ({
    /** The ID of the page. */
    id?: string;
    /** The title of the page. */
    title: string;
  } | {
    /** The ID. */
    id: string;
    /** The name of the user. */
    name?: string;
  } | {
    /** The ID. */
    id?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query bothConditional($a: Boolean!, $b: Boolean!) {
 *   getHomepage {
 *     title @include(if: $a)
 *     title @include(if: $b)
 *   }
 * }
 * ```
 */
export type BothConditionalQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragment($a: Boolean!, $b: Boolean!) {
 *   getHomepage {
 *     ...pageFields
 *   }
 * }
 * ```
 */
export type FragmentQuery = {
  /** Get the homepage. */
  getHomepage?: PageFieldsFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineFragment($a: Boolean!, $b: Boolean!) {
 *   getHomepage {
 *     id @include(if: $a)
 *     title
 *     ... on NodePage {
 *       id @include(if: $b)
 *       title @include(if: $a)
 *     }
 *   }
 * }
 * ```
 */
export type InlineFragmentQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id?: string;
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedBothConditional($a: Boolean!, $b: Boolean!) {
 *   getMenu {
 *     links @include(if: $a) {
 *       link {
 *         label
 *       }
 *       subtree {
 *         link {
 *           url
 *         }
 *       }
 *     }
 *     links @include(if: $b) {
 *       link {
 *         url
 *       }
 *       subtree {
 *         link {
 *           url
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedBothConditionalQuery = {
  /** Load a menu. */
  getMenu?: {
    links?: {
      link: {
        label?: string;
        url?: string;
      };
      subtree: {
        link: {
          url: string;
        };
      }[];
    }[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nestedOneConditional($a: Boolean!) {
 *   getMenu {
 *     links {
 *       link {
 *         label
 *       }
 *     }
 *     links @include(if: $a) {
 *       link {
 *         url
 *       }
 *       subtree {
 *         link {
 *           label
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedOneConditionalQuery = {
  /** Load a menu. */
  getMenu?: {
    links: {
      link: {
        label: string;
        url?: string;
      };
      subtree?: {
        link: {
          label: string;
        };
      }[];
    }[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query oneConditional($a: Boolean!) {
 *   getHomepage {
 *     title @include(if: $a)
 *     title
 *     id
 *     id @skip(if: $a)
 *   }
 * }
 * ```
 */
export type OneConditionalQuery = {
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
 * query rootFieldAbstract($a: Boolean!, $b: Boolean!) {
 *   getNonNullEntity @include(if: $a) {
 *     ... on NodePage {
 *       title
 *     }
 *   }
 *   getNonNullEntity @include(if: $b) {
 *     ... on NodePage {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type RootFieldAbstractQuery = {
  /** Always get an entity. */
  getNonNullEntity?: (object | {
    /** The ID of the page. */
    id?: string;
    /** The title of the page. */
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootFieldAbstractTypenameMixed($a: Boolean!, $b: Boolean!) {
 *   getNonNullEntity @include(if: $a) {
 *     __typename
 *     ... on NodePage {
 *       title
 *     }
 *   }
 *   getNonNullEntity @include(if: $b) {
 *     __typename
 *     ... on User {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type RootFieldAbstractTypenameMixedQuery = {
  /** Always get an entity. */
  getNonNullEntity?: ({
    __typename: Entity;
  } | {
    __typename: Exclude<Entity, NodePage> | User;
    /** The ID. */
    id?: string;
  } | {
    __typename: Exclude<Entity, User> | NodePage;
    /** The title of the page. */
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootFieldAbstractTypename($a: Boolean!, $b: Boolean!) {
 *   getNonNullEntity @include(if: $a) {
 *     __typename
 *     ... on NodePage {
 *       title
 *     }
 *   }
 *   getNonNullEntity @include(if: $b) {
 *     __typename
 *     ... on NodePage {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type RootFieldAbstractTypenameQuery = {
  /** Always get an entity. */
  getNonNullEntity?: ({
    __typename: Exclude<Entity, NodePage>;
  } | {
    __typename: NodePage;
    /** The ID of the page. */
    id?: string;
    /** The title of the page. */
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootField($a: Boolean!) {
 *   getNonNullEntity @include(if: $a) {
 *     id
 *   }
 *   getNonNullEntity {
 *     entityType
 *   }
 * }
 * ```
 */
export type RootFieldQuery = {
  /** Always get an entity. */
  getNonNullEntity: {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootFieldSameCondition($a: Boolean!) {
 *   getNonNullEntity @include(if: $a) {
 *     id
 *   }
 *   getNonNullEntity @include(if: $a) {
 *     entityType
 *   }
 * }
 * ```
 */
export type RootFieldSameConditionQuery = {
  /** Always get an entity. */
  getNonNullEntity?: {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AbstractTypeQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type BothConditionalQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type FragmentQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineFragmentQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedBothConditionalQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedOneConditionalQueryVariables = Exact<{
  a: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OneConditionalQueryVariables = Exact<{
  a: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootFieldAbstractQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootFieldAbstractTypenameMixedQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootFieldAbstractTypenameQueryVariables = Exact<{
  a: boolean;
  b: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootFieldQueryVariables = Exact<{
  a: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootFieldSameConditionQueryVariables = Exact<{
  a: boolean;
}>;