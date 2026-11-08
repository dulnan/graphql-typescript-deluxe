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
 * fragment entityDetails on Entity {
 *   ...pageOrUser
 * }
 * ```
 */
export type EntityDetailsFragment = PageOrUserFragment;

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
 * fragment pageOrUser on Entity {
 *   id
 *   ... on NodePage {
 *     body
 *   }
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type PageOrUserFragment = ({
  /** The ID. */
  id: string;
  /** The name of the user. */
  name?: string;
} | {
  /** The ID. */
  id: string;
} | {
  /** The body text. */
  body?: string;
  /** The ID. */
  id: string;
});


// --------------------------------------------------------------------------------
// Fragments by Type
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityDetails on Entity {
 *   ...pageOrUser
 * }
 * ```
 */
export type EntityDetailsFragmentOnNodePage = PageOrUserFragmentOnNodePage;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageOrUser on Entity {
 *   id
 *   ... on NodePage {
 *     body
 *   }
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type PageOrUserFragmentOnNodePage = {
  /** The body text. */
  body?: string;
  /** The ID of the page. */
  id: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query homepageConditional($withDetails: Boolean!) {
 *   getHomepage {
 *     title
 *     ...pageOrUser @include(if: $withDetails)
 *   }
 * }
 * ```
 */
export type HomepageConditionalQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & Partial<PageOrUserFragmentOnNodePage>;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query homepageEntityId {
 *   getHomepage {
 *     title
 *     ...entityId
 *   }
 * }
 * ```
 */
export type HomepageEntityIdQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & EntityIdFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query homepageNested {
 *   getHomepage {
 *     title
 *     ...entityDetails
 *   }
 * }
 * ```
 */
export type HomepageNestedQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & EntityDetailsFragmentOnNodePage;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query homepageOnlySpread {
 *   getHomepage {
 *     ...pageOrUser
 *   }
 * }
 * ```
 */
export type HomepageOnlySpreadQuery = {
  /** Get the homepage. */
  getHomepage?: PageOrUserFragmentOnNodePage;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query homepage {
 *   getHomepage {
 *     title
 *     ...pageOrUser
 *   }
 * }
 * ```
 */
export type HomepageQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  } & PageOrUserFragmentOnNodePage;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query randomEntity {
 *   getRandomEntity {
 *     ...pageOrUser
 *   }
 * }
 * ```
 */
export type RandomEntityQuery = {
  /** Get random entity. */
  getRandomEntity?: PageOrUserFragment;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type HomepageConditionalQueryVariables = Exact<{
  withDetails: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type HomepageEntityIdQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type HomepageNestedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type HomepageOnlySpreadQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type HomepageQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RandomEntityQueryVariables = Exact<{ [key: string]: never; }>;