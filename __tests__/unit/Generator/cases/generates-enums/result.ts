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
export const EntityType = {
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA'
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment fragmentWithEnum on NodePage {
 *   entityType
 * }
 * ```
 */
export type FragmentWithEnumFragment = {
  /** The EntityType enum. */
  entityType: EntityType;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query generatesEnums {
 *   getRandomEntity {
 *     ...fragmentWithEnum
 *   }
 * }
 * ```
 */
export type GeneratesEnumsQuery = {
  /** Get random entity. */
  getRandomEntity?: FragmentWithEnumFragment;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type GeneratesEnumsQueryVariables = Exact<{ [key: string]: never; }>;