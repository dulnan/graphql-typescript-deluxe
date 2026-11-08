// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Query = 'Query';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment rootFields on Query {
 *   isAvailable
 * }
 * ```
 */
export type RootFieldsFragment = {
  __typename: Query;
  /**
   * A very complex and long description. // Contains JS style syntax.
   * /* A full comment. *\/
   * Another line.
   * *\/ Another comment but broken /*
   * *\//*\/*\/*\/*\/*\/**\////*\/**\/*\/*\/*\//*\/*\/*\/*\/**\/*\/*\/*\/*\/*\/***\/ *\/ *\/ *\/* *\/
   */
  isAvailable?: boolean;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootWithConditionalFragment($withFields: Boolean!) {
 *   isAvailable
 *   ...rootFields @include(if: $withFields)
 * }
 * ```
 */
export type RootWithConditionalFragmentQuery = {
  __typename?: Query;
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
 * query rootWithFragment {
 *   ...rootFields
 * }
 * ```
 */
export type RootWithFragmentQuery = {
  __typename: Query;
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
 * query rootWithInlineFragment {
 *   ... on Query {
 *     isAvailable
 *   }
 * }
 * ```
 */
export type RootWithInlineFragmentQuery = {
  __typename: Query;
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
 * query rootWithoutTypename {
 *   isAvailable
 * }
 * ```
 */
export type RootWithoutTypenameQuery = {
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
 * query rootWithTypename {
 *   __typename
 *   isAvailable
 * }
 * ```
 */
export type RootWithTypenameQuery = {
  __typename: Query;
  /**
   * A very complex and long description. // Contains JS style syntax.
   * /* A full comment. *\/
   * Another line.
   * *\/ Another comment but broken /*
   * *\//*\/*\/*\/*\/*\/**\////*\/**\/*\/*\/*\//*\/*\/*\/*\/**\/*\/*\/*\/*\/*\/***\/ *\/ *\/ *\/* *\/
   */
  isAvailable?: boolean;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type RootWithConditionalFragmentQueryVariables = Exact<{
  withFields: boolean;
}>;

/** @see {@link file://./test.graphql} */
export type RootWithFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootWithInlineFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootWithoutTypenameQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type RootWithTypenameQueryVariables = Exact<{ [key: string]: never; }>;