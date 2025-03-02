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
  MEDIA: 'MEDIA',
} as const
export type EntityType = (typeof EntityType)[keyof typeof EntityType]

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fragmentInterface {
 *   getRandomEntity {
 *     ... on Entity {
 *       id
 *       entityType
 *     }
 *   }
 * }
 * ```
 */
export type FragmentInterfaceQuery = {
  /** Get random entity. */
  getRandomEntity?: {
    /** The EntityType enum. */
    entityType: EntityType
    /** The ID. */
    id: string
  }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type FragmentInterfaceQueryVariables = object
