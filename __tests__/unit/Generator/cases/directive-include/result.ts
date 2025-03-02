// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
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
        categories?: Array<{
          /** The label. */
          label: string
        }>
      }
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type DirectivesIncludeQueryVariables = {
  withAuthor?: boolean | null
  withCategories?: boolean | null
}
