// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type NodeAccomodation = 'NodeAccomodation';
type NodeAddress = 'NodeAddress';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment addressCard on NodeAddress {
 *   address: fieldAddressForm {
 *     additionalName
 *     addressLine1
 *     addressLine2
 *     locality
 *   }
 * }
 * ```
 */
export type AddressCardFragment = {
  address?: {
    additionalName?: string;
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment addressEmail on NodeAddress {
 *   __typename
 *   fieldEmail
 * }
 * ```
 */
export type AddressEmailFragment = {
  __typename: NodeAddress;
  fieldEmail?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeAccomodation on NodeAccomodation {
 *   __typename
 *   title
 *   address {
 *     ...addressCard
 *     ...addressEmail
 *   }
 * }
 * ```
 */
export type NodeAccomodationFragment = {
  __typename: NodeAccomodation;
  address?: AddressCardFragment & AddressEmailFragment;
  title?: string;
};