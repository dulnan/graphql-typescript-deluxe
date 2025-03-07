// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 * @example
 * ```graphql
 * fragment formSubmission on FormSubmission {
 *   id
 *   timestamp
 * }
 * ```
 */
export type FormSubmissionFragment = {
  id: string
  timestamp: number
}

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 * @example
 * ```graphql
 * subscription subscriptions {
 *   formSubmitted {
 *     ...formSubmission
 *   }
 * }
 * ```
 */
export type SubscriptionsSubscription = {
  formSubmitted?: FormSubmissionFragment
}

// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 *
 */
export type SubscriptionsSubscriptionVariables = Exact<{ [key: string]: never }>
