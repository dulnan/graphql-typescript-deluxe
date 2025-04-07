// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type EntriesItemOne = 'EntriesItemOne';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment oneA on EntriesItemOne {
 *   one {
 *     two {
 *       one {
 *         id
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type OneAFragment = {
  one?: {
    two?: {
      one?: {
        id?: string;
      };
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment oneB on EntriesItemOne {
 *   two {
 *     two {
 *       one {
 *         id
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type OneBFragment = {
  two?: {
    two?: {
      one?: {
        id?: string;
      };
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment twoA on EntriesItemTwo {
 *   two {
 *     two {
 *       one {
 *         ...oneB
 *         id
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type TwoAFragment = {
  two?: {
    two?: {
      one?: {
        id?: string;
      } & OneBFragment;
    };
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
 * query entries(
 *   $excludeIds: [QueryArgument] = null
 *   $relatedToEntries: [EntryRelationCriteriaInput]
 * ) {
 *   entries(id: $excludeIds, relatedToEntries: $relatedToEntries) {
 *     id
 *     two {
 *       two {
 *         one {
 *           ...oneA
 *           two {
 *             id
 *           }
 *           one {
 *             two {
 *               id
 *             }
 *           }
 *         }
 *       }
 *       one {
 *         two {
 *           one {
 *             two {
 *               ...twoA
 *               one {
 *                 two {
 *                   ...twoA
 *                   id
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *     __typename
 *   }
 * }
 * ```
 */
export type EntriesQuery = {
  entries?: ({
    __typename: EntriesItemOne;
    id?: string;
    two?: {
      one?: {
        two?: {
          one?: {
            two?: {
              one?: {
                two?: {
                  id?: string;
                } & TwoAFragment;
              };
            } & TwoAFragment;
          };
        };
      };
      two?: {
        one?: ({
          one?: {
            two?: {
              id?: string;
              one?: {
                id?: string;
              };
            };
          };
        } & {
          two?: {
            id?: string;
          };
        });
      };
    };
  } | null)[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type EntriesQueryVariables = Exact<{
  excludeIds?: (QueryArgument | null)[] | null;
  relatedToEntries?: (EntryRelationCriteriaInput | null)[] | null;
}>;


// --------------------------------------------------------------------------------
// Input Types
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * input EntryRelationCriteriaInput {
 *   arg: [QueryArgument]
 * }
 * ```
 */
export type EntryRelationCriteriaInput = {
  arg?: (QueryArgument | null)[] | null;
};

/**
 * @example
 * ```graphql
 * input QueryArgument {
 *   criteria: [EntryRelationCriteriaInput]
 * }
 * ```
 */
export type QueryArgument = {
  criteria?: (EntryRelationCriteriaInput | null)[] | null;
};