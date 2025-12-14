// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Bird = 'Bird';
type Cat = 'Cat';
type Dog = 'Dog';
type Fish = 'Fish';
type Insect = 'Insect';
type Reptile = 'Reptile';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Animal = Bird | Cat | Dog | Fish | Insect | Reptile;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment catFragment on Cat {
 *   color
 * }
 * ```
 */
export type CatFragmentFragment = {
  color?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment dogFragment on Dog {
 *   breed
 * }
 * ```
 */
export type DogFragmentFragment = {
  breed?: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query typenameExcludeFallback {
 *   animals {
 *     __typename
 *     ...dogFragment
 *     ...catFragment
 *   }
 * }
 * ```
 */
export type TypenameExcludeFallbackQuery = {
animals: (((CatFragmentFragment & { __typename: Cat }) | (DogFragmentFragment & { __typename: Dog }) | {
  __typename: Exclude<Animal, Cat | Dog>;
}))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type TypenameExcludeFallbackQueryVariables = Exact<{ [key: string]: never; }>;