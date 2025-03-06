// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 * @example
 * ```graphql
 * query directivesInclude(
 *   $withAuthor: Boolean = false
 *   $withCategories: Boolean = true
 * ) {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       authorOptional: author @include(if: $withAuthor) {
 *         name
 *         email
 *       }
 *
 *       authorRequired: author {
 *         name
 *         email
 *       }
 *
 *       categories @include(if: $withCategories) {
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type DirectivesIncludeQuery = {
  /** Get random entity. */
  getRandomEntity?:
    | object
    | {
        /** The author of the article. */
        authorOptional?: {
          /** Email address of the author. */
          email?: string
          /** Name of the author. */
          name: string
        }
        /** The author of the article. */
        authorRequired: {
          /** Email address of the author. */
          email?: string
          /** Name of the author. */
          name: string
        }
        /** Categories of this article. */
        categories?: {
          /** The label. */
          label: string
        }[]
      }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 */
export type DirectivesIncludeQueryVariables = Exact<{
  withAuthor?: boolean | null
  withCategories?: boolean | null
}>
