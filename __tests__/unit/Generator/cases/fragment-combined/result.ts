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
 * query test {
 *   getRandomEntity {
 *     entityType
 *
 *     ... on Entity {
 *       id
 *     }
 *
 *     ... on Node {
 *       title
 *     }
 *
 *     ... on NodePage {
 *       body
 *     }
 *   }
 * }
 * ```
 */
export type TestQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | {
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
      }
    | {
        /** The body text. */
        body?: string
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
        /** The title of the node. */
        title: string
      }
    | {
        /** The EntityType enum. */
        entityType: EntityType
        /** The ID. */
        id: string
        /** The title of the node. */
        title: string
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type TestQueryVariables = object
