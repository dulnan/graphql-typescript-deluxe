// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityBasic on Entity {
 *   id
 * }
 * ```
 */
export type EntityBasicFragment = {
  id: string | number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityDetails on Entity {
 *   entityType
 * }
 * ```
 */
export type EntityDetailsFragment = {
  entityType: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeArticleInfo on NodeArticle {
 *   body
 *   tags
 * }
 * ```
 */
export type NodeArticleInfoFragment = {
  body?: string;
  tags?: string[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodePageBasic on NodePage {
 *   id
 *   title
 * }
 * ```
 */
export type NodePageBasicFragment = {
  id: string | number;
  title?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodePageDetails on NodePage {
 *   body
 *   deprecatedTitle
 * }
 * ```
 */
export type NodePageDetailsFragment = {
  body?: string;
  deprecatedTitle?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment simpleImpl on SimpleImpl {
 *   value
 * }
 * ```
 */
export type SimpleImplFragment = {
  value: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query allCombined {
 *   getRandomEntity {
 *     ...entityBasic
 *     ...nodePageDetails
 *     ... on NodeArticle {
 *       tags
 *     }
 *   }
 * }
 * ```
 */
export type AllCombinedQuery = {
  getRandomEntity?: ({
    id: string | number;
    tags?: string[];
  } | {
    id: string | number;
  } | {
    id: string | number;
  } & NodePageDetailsFragment);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragmentAndInlineOnSameConcreteType {
 *   getRandomEntity {
 *     ...nodePageBasic
 *     ... on NodePage {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type FragmentAndInlineOnSameConcreteTypeQuery = {
  getRandomEntity?: (object | {
    body?: string;
  } & NodePageBasicFragment);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineAndFragmentOnConcreteField {
 *   getNodePage {
 *     ...nodePageBasic
 *     ... on NodePage {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type InlineAndFragmentOnConcreteFieldQuery = {
  getNodePage?: {
    body?: string;
  } & NodePageBasicFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineOnSingleImplementer {
 *   getSingleImplementer {
 *     ... on SimpleImpl {
 *       value
 *     }
 *   }
 * }
 * ```
 */
export type InlineOnSingleImplementerQuery = {
  getSingleImplementer?: {
    value: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineSpreadConcreteOnInterface {
 *   getRandomEntity {
 *     ... on NodePage {
 *       title
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type InlineSpreadConcreteOnInterfaceQuery = {
  getRandomEntity?: (object | {
    body?: string;
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineSpreadOnConcreteField {
 *   getNodePage {
 *     ... on NodePage {
 *       title
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type InlineSpreadOnConcreteFieldQuery = {
  getNodePage?: {
    body?: string;
    title?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query interfaceFragmentAndInlineSpread {
 *   getRandomEntity {
 *     ...entityBasic
 *     ... on Entity {
 *       entityType
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFragmentAndInlineSpreadQuery = {
  getRandomEntity?: {
    entityType: string;
    id: string | number;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query mixedFragmentCounts {
 *   getRandomEntity {
 *     ...nodePageBasic
 *     ...nodePageDetails
 *     ...nodeArticleInfo
 *   }
 * }
 * ```
 */
export type MixedFragmentCountsQuery = {
  getRandomEntity?: (NodeArticleInfoFragment | NodePageBasicFragment & NodePageDetailsFragment | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query mixedInterfaceAndConcreteInline {
 *   getRandomEntity {
 *     ...entityBasic
 *     ... on Entity {
 *       entityType
 *     }
 *     ... on NodePage {
 *       title
 *     }
 *     ... on NodeArticle {
 *       tags
 *     }
 *   }
 * }
 * ```
 */
export type MixedInterfaceAndConcreteInlineQuery = {
  getRandomEntity?: ({
    entityType: string;
    id: string | number;
    tags?: string[];
  } | {
    entityType: string;
    id: string | number;
    title?: string;
  } | {
    entityType: string;
    id: string | number;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query multipleConcreteInlineSpreads {
 *   getRandomEntity {
 *     ... on NodePage {
 *       title
 *       body
 *     }
 *     ... on NodeArticle {
 *       body
 *       tags
 *     }
 *   }
 * }
 * ```
 */
export type MultipleConcreteInlineSpreadsQuery = {
  getRandomEntity?: (object | {
    body?: string;
    tags?: string[];
  } | {
    body?: string;
    title?: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query singleTypeInterface {
 *   getSingleImplementer {
 *     ...simpleImpl
 *   }
 * }
 * ```
 */
export type SingleTypeInterfaceQuery = {
  getSingleImplementer?: SimpleImplFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query twoAbstractFragments {
 *   getRandomEntity {
 *     ...entityBasic
 *     ...entityDetails
 *   }
 * }
 * ```
 */
export type TwoAbstractFragmentsQuery = {
  getRandomEntity?: {
    entityType: string;
    id: string | number;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query twoFragmentsSameType {
 *   getRandomEntity {
 *     ...nodePageBasic
 *     ...nodePageDetails
 *   }
 * }
 * ```
 */
export type TwoFragmentsSameTypeQuery = {
  getRandomEntity?: (NodePageBasicFragment & NodePageDetailsFragment | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AllCombinedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type FragmentAndInlineOnSameConcreteTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InlineAndFragmentOnConcreteFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InlineOnSingleImplementerQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InlineSpreadConcreteOnInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InlineSpreadOnConcreteFieldQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type InterfaceFragmentAndInlineSpreadQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type MixedFragmentCountsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type MixedInterfaceAndConcreteInlineQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type MultipleConcreteInlineSpreadsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SingleTypeInterfaceQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type TwoAbstractFragmentsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type TwoFragmentsSameTypeQueryVariables = Exact<{ [key: string]: never; }>;