// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment allBlocks on Block {
 *   ...blockText
 *   ...blockImage
 *   ...blockContainer
 * }
 * ```
 */
export type AllBlocksFragment =
  | BlockContainerFragment
  | BlockImageFragment
  | BlockTextFragment
  | object

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment blockContainer on BlockContainer {
 *   blocks {
 *     id
 *   }
 * }
 * ```
 */
export type BlockContainerFragment = {
  blocks?: Array<{
    id: string
  } | null>
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment blockImage on BlockImage {
 *   imageUrl
 * }
 * ```
 */
export type BlockImageFragment = {
  imageUrl?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment blockItem on Block {
 *   id
 * }
 * ```
 */
export type BlockItemFragment = {
  id: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment blockText on BlockText {
 *   text
 * }
 * ```
 */
export type BlockTextFragment = {
  text?: string
}

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment nodePage on NodePage {
 *   blocks {
 *     ...blockItem
 *     props {
 *       ...allBlocks
 *     }
 *   }
 * }
 * ```
 */
export type NodePageFragment = {
  blocks?: Array<{
    id: string
    props: AllBlocksFragment
  } | null>
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query spreadsOnInterface {
 *   getPage {
 *     ...nodePage
 *   }
 * }
 * ```
 */
export type SpreadsOnInterfaceQuery = {
  getPage?: NodePageFragment
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type SpreadsOnInterfaceQueryVariables = object
