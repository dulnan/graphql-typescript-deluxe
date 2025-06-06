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
 * fragment nodePage on NodePage {
 *   alias_title: title
 * }
 * ```
 */
export type NodePageFragment = {
  /** The title of the page. */
  alias_title: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query inlineFields {
 *   alias_getRandomEntity: getRandomEntity {
 *     alias_id: id
 *     ...nodePage
 *     ... on NodePage {
 *       alias_body: body
 *     }
 *   }
 * }
 * ```
 */
export type InlineFieldsQuery = {
  /** Get random entity. */
  alias_getRandomEntity?: ({
    /** The ID. */
    alias_id: string;
  } | {
    /** The body text. */
    alias_body?: string;
    /** The ID. */
    alias_id: string;
  } & NodePageFragment);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type InlineFieldsQueryVariables = Exact<{ [key: string]: never; }>;