// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
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
  getRandomEntity:
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
        categories?: Array<{
          /** The label. */
          label: string
        }>
        /** Categories of this article. */
        categoriesSkip?: Array<{
          /** The label. */
          label: string
        }>
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type DirectivesSkipQueryVariables = {
  skipAuthor?: boolean | null
  skipCategories?: boolean | null
}
