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
 * query enumFromInput($entityType: EntityType!, $id: ID!) {
 *   entityById(entityType: $entityType, id: $id) {
 *     id
 *   }
 * }
 * ```
 */
export type EnumFromInputQuery = {
  /** Get an entity by ID. */
  entityById?: {
    /** The ID. */
    id: string
  }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type EnumFromInputQueryVariables = {
  entityType: EntityType
  id: string | number
}
