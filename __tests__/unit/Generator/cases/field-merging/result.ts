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
 * fragment fieldMergingOne on Query {
 *   getHomepage {
 *     title
 *   }
 * }
 * ```
 */
export type FieldMergingOneFragment = {
  /** Get the homepage. */
  getHomepage?: {
    /** The title of the page. */
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment fieldMergingTwo on Query {
 *   getHomepage {
 *     body
 *   }
 * }
 * ```
 */
export type FieldMergingTwoFragment = {
  /** Get the homepage. */
  getHomepage?: {
    /** The body text. */
    body?: string;
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
 * query fieldMerging {
 *   ...fieldMergingOne
 *   ...fieldMergingTwo
 * 
 *   getHomepage {
 *     id
 *   }
 * }
 * ```
 */
export type FieldMergingQuery = {
  /** Get the homepage. */
  getHomepage?: {
    /** The body text. */
    body?: string;
    /** The ID of the page. */
    id: string;
    /** The title of the page. */
    title: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FieldMergingQueryVariables = Exact<{ [key: string]: never; }>;