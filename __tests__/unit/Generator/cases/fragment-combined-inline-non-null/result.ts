// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * enum EntityType {
 *   """
 *   A node.
 *   """
 *   NODE
 * 
 *   """
 *   A media.
 *   """
 *   MEDIA
 * }
 * ```
 */
export const EntityType = Object.freeze({
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA'
} as const);
export type EntityType = 'NODE' | 'MEDIA';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeArticle on NodeArticle {
 *   tags
 * }
 * ```
 */
export type NodeArticleFragment = {
  /** The tags. */
  tags?: (string | null)[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query fragmentInterface {
 *   getNonNullEntity {
 *     entityType
 *     ... on Entity {
 *       id
 *     }
 * 
 *     ... on Node {
 *       title
 *     }
 * 
 *     ... on NodePage {
 *       title
 *       body
 *     }
 * 
 *     ...nodeArticle
 *   }
 * }
 * ```
 */
export type FragmentInterfaceQuery = {
  /** Always get an entity. */
  getNonNullEntity: ({
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
    /** The title of the node. */
    title: string;
  } & NodeArticleFragment | {
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
  } | {
    /** The body text. */
    body?: string;
    /** The EntityType enum. */
    entityType: EntityType;
    /** The ID. */
    id: string;
    /** The title of the page. */
    title: string;
  });
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FragmentInterfaceQueryVariables = Exact<{ [key: string]: never; }>;