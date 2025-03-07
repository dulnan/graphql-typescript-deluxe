// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------


type DefaultEntityUrl = 'DefaultEntityUrl';

type DefaultUrl = 'DefaultUrl';

type Image = 'Image';

type NodeArticle = 'NodeArticle';

type NodePage = 'NodePage';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------


export type Entity = NodePage | NodeArticle | Image;


export type Url = DefaultEntityUrl | DefaultUrl;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment route on Query {
 *   route(path: "Foobar") {
 *     ... on DefaultEntityUrl {
 *       entity {
 *         id
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type RouteFragment = {
  route?: (object | {
    entity?: {
      id: string;
    };
  });
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fieldMergingDeepNested {
 *   route(path: "Foobar") {
 *     __typename
 *     ... on DefaultEntityUrl {
 *       entity {
 *         __typename
 *         id
 *         ... on NodePage {
 *           title
 *         }
 * 
 *         ... on NodeArticle {
 *           body
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingDeepNestedQuery = {
  route?: ({
    __typename: DefaultEntityUrl;
    entity?: ({
      __typename: Image;
      id: string;
    } | {
      __typename: NodeArticle;
      body: string;
      id: string;
    } | {
      __typename: NodePage;
      id: string;
      title: string;
    });
  } | {
    __typename: DefaultUrl;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type FieldMergingDeepNestedQueryVariables = Exact<{ [key: string]: never; }>;