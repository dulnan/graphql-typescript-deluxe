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
 * fragment metatagAttribute on MetatagAttribute {
 *   key
 *   value
 * }
 * ```
 */
export type MetatagAttributeFragment = {
  key: string
  value: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment metatag on Metatag {
 *   id
 *   tag
 *   attributes {
 *     ...metatagAttribute
 *   }
 * }
 * ```
 */
export type MetatagFragment = {
  attributes: Array<MetatagAttributeFragment>
  id: string
  tag: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment routeEntity on EntityUrl {
 *   metatags {
 *     ...metatag
 *   }
 *   entity {
 *     id
 *   }
 *   routeName
 * }
 * ```
 */
export type RouteEntityFragment = {
  entity?: {
    id: string
  }
  metatags: Array<MetatagFragment>
  routeName: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment route on Query {
 *   route(path: "Foobar") {
 *     ...routeInternal
 *     ...routeEntity
 *   }
 * }
 * ```
 */
export type RouteFragment = {
  route?: RouteEntityFragment | RouteInternalFragment | object
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment routeInternal on InternalUrl {
 *   metatags {
 *     ...metatag
 *   }
 *   routeName
 * }
 * ```
 */
export type RouteInternalFragment = {
  metatags: Array<MetatagFragment>
  routeName: string
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fieldMergingDeepNested {
 *   ...route
 *
 *   route(path: "Foobar") {
 *     __typename
 *     ... on EntityUrl {
 *       entity {
 *         ... on NodePage {
 *           title
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingDeepNestedQuery = {
  route?:
    | {
        __typename: DefaultEntityUrl
        entity?: {
          id: string
          title: string
        }
        metatags: Array<MetatagFragment>
        routeName: string
      }
    | {
        __typename: DefaultInternalUrl
        metatags: Array<MetatagFragment>
        routeName: string
      }
    | {
        __typename: DefaultUrl
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingDeepNestedQueryVariables = object
