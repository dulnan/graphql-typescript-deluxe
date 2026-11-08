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
 * fragment domainLabel on Entity {
 *   ... on Domain {
 *     label
 *   }
 * }
 * ```
 */
export type DomainLabelFragment = (Record<string, never> | {
  /** The label for the domain. */
  label: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment imageOnly on Media {
 *   ... on MediaImage {
 *     image
 *   }
 * }
 * ```
 */
export type ImageOnlyFragment = (Record<string, never> | {
  /** The image URL. */
  image: string | null;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageOrUser on Entity {
 *   ... on NodePage {
 *     body
 *   }
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type PageOrUserFragment = (Record<string, never> | {
  /** The body text. */
  body: string | null;
} | {
  /** The name of the user. */
  name: string | null;
});

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

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageUserName on NodePage {
 *   ...userName
 * }
 * ```
 */
export type PageUserNameFragment = Record<string, never>;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment userName on Entity {
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type UserNameFragment = (Record<string, never> | {
  /** The name of the user. */
  name: string | null;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment userWithName on User {
 *   ...userName
 * }
 * ```
 */
export type UserWithNameFragment = UserNameFragmentOnUser;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment video on MediaVideo {
 *   id
 *   videoUrl
 * }
 * ```
 */
export type VideoFragment = {
  /** The ID of the media video. */
  id: string;
  /** The URL of the video (external). */
  videoUrl: string | null;
};


// --------------------------------------------------------------------------------
// Fragments by Type
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageOrUser on Entity {
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
  body: string | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment userName on Entity {
 *   ... on User {
 *     name
 *   }
 * }
 * ```
 */
export type UserNameFragmentOnUser = {
  /** The name of the user. */
  name: string | null;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query abstractBranch {
 *   getRandomEntity {
 *     id
 *     ...userWithName
 *   }
 * }
 * ```
 */
export type AbstractBranchQuery = {
  /** Get random entity. */
  getRandomEntity: ({
    /** The ID. */
    id: string;
  } | {
    /** The ID. */
    id: string;
  } & UserWithNameFragment) | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query conditional($withName: Boolean!) {
 *   getHomepage {
 *     ...userName @include(if: $withName)
 *     title
 *   }
 * }
 * ```
 */
export type ConditionalQuery = {
  /** Get the homepage. */
  getHomepage: {
    /** The title of the page. */
    title: string;
  } | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nested {
 *   getHomepage {
 *     ...pageUserName
 *     title
 *   }
 * }
 * ```
 */
export type NestedQuery = {
  /** Get the homepage. */
  getHomepage: {
    /** The title of the page. */
    title: string;
  } | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nextToFields {
 *   getHomepage {
 *     ...userName
 *     title
 *   }
 * }
 * ```
 */
export type NextToFieldsQuery = {
  /** Get the homepage. */
  getHomepage: {
    /** The title of the page. */
    title: string;
  } | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query nextToFragment {
 *   getHomepage {
 *     ...userName
 *     ...pageTitle
 *   }
 * }
 * ```
 */
export type NextToFragmentQuery = {
  /** Get the homepage. */
  getHomepage: PageTitleFragment | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query onlyEmptyFragments {
 *   getHomepage {
 *     ...userName
 *     ...domainLabel
 *   }
 * }
 * ```
 */
export type OnlyEmptyFragmentsQuery = {
  /** Get the homepage. */
  getHomepage: Record<string, never> | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query selectsOnType {
 *   getHomepage {
 *     ...pageOrUser
 *     title
 *   }
 * }
 * ```
 */
export type SelectsOnTypeQuery = {
  /** Get the homepage. */
  getHomepage: {
    /** The title of the page. */
    title: string;
  } & PageOrUserFragmentOnNodePage | null;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query shortcut {
 *   search {
 *     ...imageOnly
 *     ...video
 *   }
 * }
 * ```
 */
export type ShortcutQuery = {
  /** Perform a search. */
  search: ((Record<string, never> | VideoFragment))[] | null;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AbstractBranchQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ConditionalQueryVariables = Exact<{
  withName: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type NestedQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NextToFieldsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NextToFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type OnlyEmptyFragmentsQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SelectsOnTypeQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type ShortcutQueryVariables = Exact<{ [key: string]: never; }>;