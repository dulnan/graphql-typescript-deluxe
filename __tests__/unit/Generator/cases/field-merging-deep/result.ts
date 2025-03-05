// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * fragment menuLinkTreeElement on MenuLinkTreeElement {
 *   link {
 *     label
 *     url
 *   }
 * }
 * ```
 */
export type MenuLinkTreeElementFragment = {
  link: {
    label: string
    url: string
  }
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * query fieldMergingDeep {
 *   getMenu {
 *     name
 *     links {
 *       ...menuLinkTreeElement
 *       subtree {
 *         ...menuLinkTreeElement
 *         subtree {
 *           ...menuLinkTreeElement
 *           subtree {
 *             ...menuLinkTreeElement
 *             subtree {
 *               ...menuLinkTreeElement
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingDeepQuery = {
  /** Load a menu. */
  getMenu?: {
    links: Array<
      {
        subtree: Array<
          {
            subtree: Array<
              {
                subtree: Array<
                  {
                    subtree: Array<MenuLinkTreeElementFragment>
                  } & MenuLinkTreeElementFragment
                >
              } & MenuLinkTreeElementFragment
            >
          } & MenuLinkTreeElementFragment
        >
      } & MenuLinkTreeElementFragment
    >
    name: string
  }
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 */
export type FieldMergingDeepQueryVariables = Exact<{ [key: string]: never }>
