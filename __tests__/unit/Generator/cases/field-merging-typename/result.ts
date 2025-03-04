// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type DefaultEntityUrl = 'DefaultEntityUrl'

type DefaultInternalUrl = 'DefaultInternalUrl'

type DefaultUrl = 'DefaultUrl'

// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Url = DefaultEntityUrl | DefaultInternalUrl | DefaultUrl

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment route on Query {
 *   route(path: "Foobar") {
 *     foobar: path
 *     __typename
 *     ... on InternalUrl {
 *       path
 *     }
 *   }
 * }
 * ```
 */
export type RouteFragment = {
  route?:
    | {
        __typename: DefaultEntityUrl | DefaultInternalUrl
        foobar?: string
        path: string
      }
    | {
        __typename: DefaultUrl
        foobar?: string
      }
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fieldMergingTypename {
 *   ...route
 *
 *   route(path: "Foobar") {
 *     foobar: path
 *     __typename
 *     ... on EntityUrl {
 *       routeName
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingTypenameQuery = {
  route?:
    | {
        __typename: DefaultEntityUrl
        foobar?: string
        path: string
        routeName: string
      }
    | {
        __typename: DefaultInternalUrl
        foobar?: string
        path: string
      }
    | {
        __typename: DefaultUrl
        foobar?: string
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingTypenameQueryVariables = object
