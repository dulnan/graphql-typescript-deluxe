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
 * fragment createUserResponse on CreateUserResponse {
 *   errors
 * 
 *   ... on CreateUserResponse {
 *     mergedErrors: errors
 *   }
 * }
 * ```
 */
export type CreateUserResponseFragment = {
  errors?: (string | null)[];
  mergedErrors?: (string | null)[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * mutation redundantFragmentSpread($email: String!) {
 *   createUserInline: createUser(email: $email) {
 *     ... on CreateUserResponse {
 *       inlineErrors: errors
 *     }
 *   }
 * 
 *   createUserInlineBoth: createUser(email: $email) {
 *     ... on CreateUserResponse {
 *       inlineErrors: errors
 *       ...createUserResponse
 *     }
 *   }
 * 
 *   createUserSpread: createUser(email: $email) {
 *     ...createUserResponse
 *   }
 * }
 * ```
 */
export type RedundantFragmentSpreadMutation = {
  /** Create a user. */
  createUserInline: {
    inlineErrors?: (string | null)[];
  };
  /** Create a user. */
  createUserInlineBoth: {
    inlineErrors?: (string | null)[];
  } & CreateUserResponseFragment;
  /** Create a user. */
  createUserSpread: CreateUserResponseFragment;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 */
export type RedundantFragmentSpreadMutationVariables = Exact<{
  email: string;
}>;