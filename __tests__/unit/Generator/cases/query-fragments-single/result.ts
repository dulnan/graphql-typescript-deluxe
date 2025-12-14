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
 * fragment mediaImage on MediaImage {
 *   id
 * }
 * ```
 */
export type MediaImageFragment = {
  /** The ID of the media image. */
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
 * query queryFragmentsSingle {
 *   getRandomEntity {
 *     ...mediaImage
 *   }
 * }
 * ```
 */
export type QueryFragmentsSingleQuery = {
  /** Get random entity. */
  getRandomEntity?: (MediaImageFragment | object);
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type QueryFragmentsSingleQueryVariables = Exact<{ [key: string]: never; }>;