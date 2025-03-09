// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
    label: string;
    url: string;
  };
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
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
    links: ({
      subtree: ({
        subtree: ({
          subtree: ({
            subtree: MenuLinkTreeElementFragment[];
          } & MenuLinkTreeElementFragment)[];
        } & MenuLinkTreeElementFragment)[];
      } & MenuLinkTreeElementFragment)[];
    } & MenuLinkTreeElementFragment)[];
    name: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type FieldMergingDeepQueryVariables = Exact<{ [key: string]: never; }>;