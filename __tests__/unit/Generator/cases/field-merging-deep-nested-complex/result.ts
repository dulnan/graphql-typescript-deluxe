// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment entityUrl on EntityUrl {
 *   entity {
 *     id
 *   }
 * }
 * ```
 */
export type EntityUrlFragment = {
  entity?: {
    id: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment fieldMergingDeepNested on Query {
 *   route(path: $path) {
 *     ... on EntityUrl {
 *       ...entityUrl
 *     }
 *   }
 * }
 * ```
 */
export type FieldMergingDeepNestedFragment = {
  route?: EntityUrlFragment;
};