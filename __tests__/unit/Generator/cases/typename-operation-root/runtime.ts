import type * as T from './result'

// The responses as Apollo and urql receive them.
export const withoutTypename: T.RootWithoutTypenameQuery = { isAvailable: true }
export const withTypename: T.RootWithTypenameQuery = {
  __typename: 'Query',
  isAvailable: true,
}
export const withFragment: T.RootWithFragmentQuery = {
  __typename: 'Query',
  isAvailable: true,
}
export const conditionalIncluded: T.RootWithConditionalFragmentQuery = {
  __typename: 'Query',
  isAvailable: true,
}
export const conditionalSkipped: T.RootWithConditionalFragmentQuery = {
  isAvailable: true,
}
export const withInlineFragment: T.RootWithInlineFragmentQuery = {
  __typename: 'Query',
  isAvailable: true,
}

// @ts-expect-error The fragment adds __typename.
export const withFragmentMissing: T.RootWithFragmentQuery = {
  isAvailable: true,
}
