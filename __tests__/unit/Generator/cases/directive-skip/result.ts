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
 * query directivesSkip(
 *   $skipAuthor: Boolean = false
 *   $skipCategories: Boolean = true
 * ) {
 *   getRandomEntity {
 *     ... on NodeArticle {
 *       authorOptional: author @skip(if: $skipAuthor) {
 *         name
 *         email
 *       }
 *
 *       authorRequired: author {
 *         name
 *         email
 *       }
 *
 *       categoriesSkip: categories @skip(if: $skipCategories) {
 *         label
 *       }
 *
 *       categories {
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type DirectivesSkipQuery = {
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
        /** Categories of this article. */
        categoriesSkip?: {
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
export type DirectivesSkipQueryVariables = Exact<{
  skipAuthor?: boolean | null
  skipCategories?: boolean | null
}>
