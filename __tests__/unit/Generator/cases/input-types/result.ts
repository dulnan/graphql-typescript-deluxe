// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/**
 * Means of contact.
 * @example
 * ```graphql
 * """
 * Means of contact.
 * """
 * enum ContactMethod {
 *   """
 *   Contact via phone.
 *   """
 *   PHONE
 *
 *   """
 *   Contact via email.
 *   """
 *   MAIL
 * }
 * ```
 */
export const ContactMethod = {
  /** Contact via phone. */
  PHONE: 'PHONE',
  /** Contact via email. */
  MAIL: 'MAIL',
} as const
export type ContactMethod = (typeof ContactMethod)[keyof typeof ContactMethod]

// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link ./test.graphql}
 *
 * @example
 * ```graphql
 * mutation inputTypes($input: SubmitContactForm!, $dryRun: Boolean = false) {
 *   submitForm(input: $input, dryRun: $dryRun)
 * }
 * ```
 */
export type InputTypesMutation = {
  /** Submit a form. */
  submitForm: boolean
}

/**
 * @see {@link ./test.graphql}
 *
 */
export type InputTypesMutationVariables = {
  dryRun?: boolean | null
  input: SubmitContactFormInput
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

/**
 * @example
 * ```graphql
 * input SubmitContactForm {
 *   firstName: String!
 *   lastName: String!
 *   contactMethod: ContactMethod = "PHONE"
 *   address: Address!
 * }
 * ```
 */
export type SubmitContactFormInput = {
  address: AddressInput
  contactMethod?: ContactMethod | null
  firstName: string
  lastName: string
}
