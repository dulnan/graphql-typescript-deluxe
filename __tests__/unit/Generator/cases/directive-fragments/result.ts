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
 * fragment entityId on Entity {
 *   id
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
 * fragment entityType on Entity {
 *   entityType
 * }
 * ```
 */
export type EntityTypeFragment = {
  /** The EntityType enum. */
  entityType: EntityType;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment menuLabels on Menu {
 *   links {
 *     link {
 *       label
 *     }
 *   }
 * }
 * ```
 */
export type MenuLabelsFragment = {
  links: {
    link: {
      label: string;
    };
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment menuUrls on Menu {
 *   name
 *   links {
 *     link {
 *       url
 *     }
 *   }
 * }
 * ```
 */
export type MenuUrlsFragment = {
  links: {
    link: {
      url: string;
    };
  }[];
  name: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageTitle on NodePage {
 *   title
 *   body
 * }
 * ```
 */
export type PageTitleFragment = {
  /** The body text. */
  body?: string;
  /** The title of the page. */
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageTypename on NodePage {
 *   __typename
 *   title
 * }
 * ```
 */
export type PageTypenameFragment = {
  __typename: NodePage;
  /** The title of the page. */
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment rootEntity on Query {
 *   getNonNullEntity {
 *     entityType
 *   }
 * }
 * ```
 */
export type RootEntityFragment = {
  /** Always get an entity. */
  getNonNullEntity: {
    /** The EntityType enum. */
    entityType: EntityType;
  };
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineAbstractFields($x: Boolean!) {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on NodePage {
 *       title @include(if: $x)
 *     }
 *   }
 * }
 * ```
 */
export type InlineAbstractFieldsQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineAbstract($x: Boolean!) {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on NodePage @include(if: $x) {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InlineAbstractQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineAbstractWithSpread($x: Boolean!) {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ... on NodePage @include(if: $x) {
 *       ...pageTitle
 *     }
 *   }
 * }
 * ```
 */
export type InlineAbstractWithSpreadQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
  } & Partial<PageTitleFragment>);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineObjectFields($x: Boolean!) {
 *   getHomepage {
 *     id
 *     title @include(if: $x)
 *   }
 * }
 * ```
 */
export type InlineObjectFieldsQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineObjectNoTypeCondition($x: Boolean!) {
 *   getHomepage {
 *     id
 *     ... @include(if: $x) {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InlineObjectNoTypeConditionQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineObject($x: Boolean!) {
 *   getHomepage {
 *     id
 *     ... on NodePage @include(if: $x) {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InlineObjectQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query overlapInlineFields($x: Boolean!) {
 *   getMenu {
 *     links {
 *       link {
 *         label
 *       }
 *     }
 *     links @include(if: $x) {
 *       link {
 *         url
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type OverlapInlineFieldsQuery = {
  /** Load a menu. */
  getMenu?: {
    links: {
      link: {
        label: string;
        url?: string;
      };
    }[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query overlapInline($x: Boolean!) {
 *   getMenu {
 *     links {
 *       link {
 *         label
 *       }
 *     }
 *     ... @include(if: $x) {
 *       links {
 *         link {
 *           url
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type OverlapInlineQuery = {
  /** Load a menu. */
  getMenu?: {
    links: {
      link: {
        label: string;
        url?: string;
      };
    }[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query overlapSpread($x: Boolean!) {
 *   getMenu {
 *     links {
 *       link {
 *         label
 *       }
 *     }
 *     ...menuUrls @include(if: $x)
 *   }
 * }
 * ```
 */
export type OverlapSpreadQuery = {
  /** Load a menu. */
  getMenu?: ({
    links: {
      link: {
        label: string;
        url?: string;
      };
    }[];
  } & Partial<Omit<MenuUrlsFragment, "links">>);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query overlapTwoSpreads($x: Boolean!, $y: Boolean!) {
 *   getMenu {
 *     ...menuUrls @include(if: $x)
 *     ...menuLabels @include(if: $y)
 *   }
 * }
 * ```
 */
export type OverlapTwoSpreadsQuery = {
  /** Load a menu. */
  getMenu?: ({
    links?: {
      link: {
        label?: string;
        url?: string;
      };
    }[];
  } & Partial<Omit<MenuUrlsFragment, "links">>);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootInline($x: Boolean!) {
 *   ... on Query @include(if: $x) {
 *     getNonNullEntity {
 *       entityType
 *     }
 *   }
 * }
 * ```
 */
export type RootInlineQuery = {
  /** Always get an entity. */
  getNonNullEntity?: {
    /** The EntityType enum. */
    entityType: EntityType;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootSpreadOverlap($x: Boolean!) {
 *   getNonNullEntity {
 *     id
 *   }
 *   ...rootEntity @include(if: $x)
 * }
 * ```
 */
export type RootSpreadOverlapQuery = {
  /** Always get an entity. */
  getNonNullEntity: {
    /** The EntityType enum. */
    entityType?: EntityType;
    /** The ID. */
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootSpread($x: Boolean!) {
 *   ...rootEntity @include(if: $x)
 * }
 * ```
 */
export type RootSpreadQuery = {
  /** Always get an entity. */
  getNonNullEntity?: {
    /** The EntityType enum. */
    entityType: EntityType;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadAbstractOnAbstract($x: Boolean!) {
 *   getNonNullEntity {
 *     __typename
 *     ...entityType @include(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadAbstractOnAbstractQuery = {
  /** Always get an entity. */
  getNonNullEntity: {
    __typename: Entity;
    /** The EntityType enum. */
    entityType?: EntityType;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadAbstractOnly($x: Boolean!) {
 *   getNonNullEntity {
 *     ...entityId @include(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadAbstractOnlyQuery = {
  /** Always get an entity. */
  getNonNullEntity: {
    /** The ID. */
    id?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadAbstract($x: Boolean!) {
 *   getRandomEntity {
 *     __typename
 *     id
 *     ...pageTitle @skip(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadAbstractQuery = {
  /** Get random entity. */
  getRandomEntity?: ({
    __typename: Exclude<Entity, NodePage>;
    /** The ID. */
    id: string;
  } | {
    __typename: NodePage;
    /** The ID. */
    id: string;
  } & Partial<PageTitleFragment>);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadObjectOnly($x: Boolean!) {
 *   getHomepage {
 *     ...pageTitle @skip(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadObjectOnlyQuery = {
  /** Get the homepage. */
  getHomepage?: Partial<PageTitleFragment>;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadObject($x: Boolean!) {
 *   getHomepage {
 *     id
 *     ...pageTitle @include(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadObjectQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
  } & Partial<PageTitleFragment>;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query spreadObjectTypename($x: Boolean!) {
 *   getHomepage {
 *     id
 *     ...pageTypename @include(if: $x)
 *   }
 * }
 * ```
 */
export type SpreadObjectTypenameQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The ID of the page. */
    id: string;
  } & Partial<PageTypenameFragment>;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InlineAbstractFieldsQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineAbstractQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineAbstractWithSpreadQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineObjectFieldsQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineObjectNoTypeConditionQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type InlineObjectQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OverlapInlineFieldsQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OverlapInlineQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OverlapSpreadQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type OverlapTwoSpreadsQueryVariables = Exact<{
  x: boolean;
  y: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootInlineQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootSpreadOverlapQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootSpreadQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadAbstractOnAbstractQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadAbstractOnlyQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadAbstractQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadObjectOnlyQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadObjectQueryVariables = Exact<{
  x: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type SpreadObjectTypenameQueryVariables = Exact<{
  x: boolean;
}>;