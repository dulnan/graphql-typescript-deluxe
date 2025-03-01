// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * mutation inputTypesPartial(
 *   $firstName: String!
 *   $lastName: String!
 *   $address: Address!
 * ) {
 *   submitForm(
 *     input: { firstName: $firstName, lastName: $lastName, address: $address }
 *   )
 * }
 * ```
 */
export type InputTypesPartialMutation = {
  /** Submit a form. */
  submitForm: boolean
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type InputTypesPartialMutationVariables = {
  address: AddressInput
  firstName: string
  lastName: string
}

// --------------------------------------------------------------------------------
// Input Types
// --------------------------------------------------------------------------------

/**
 * A valid address.
 * @example
 * ```graphql
 * """
 * A valid address.
 * """
 * input Address {
 *   """
 *   The street, including number.
 *   """
 *   street: String!
 *
 *   """
 *   The ZIP code.
 *   """
 *   zipCode: String!
 *
 *   """
 *   The locality.
 *   """
 *   locality: String!
 * }
 * ```
 */
export type AddressInput = {
  /** The locality. */
  locality: string
  /** The street, including number. */
  street: string
  /** The ZIP code. */
  zipCode: string
}
