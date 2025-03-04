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
 * query inputTypes($entityType: EntityType!, $id: ID!) {
 *   entityById(id: $id, entityType: $entityType) {
 *     id
 *   }
 * }
 * ```
 */
export type InputTypesQuery = {
  /** Get an entity by ID. */
  entityById?: {
    /** The ID. */
    id: string
  }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type InputTypesQueryVariables = {
  entityType: EntityType
  id: string | number
}
