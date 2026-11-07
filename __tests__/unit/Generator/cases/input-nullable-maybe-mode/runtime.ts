import type * as T from './result'

// Nullable variables and input fields may be left out.
export const empty: T.SearchQueryVariables = {}
export const emptyFilter: T.RequiredFilterQueryVariables = { filter: {} }

// They may also be null.
export const nulls: T.SearchQueryVariables = {
  filter: { limit: null, nested: null, sort: null },
  text: null,
}

// A non-null variable or field can't be null.
export const pageNull: T.SearchQueryVariables = {
  // @ts-expect-error The variable is non-null.
  page: null,
}
export const filterNull: T.RequiredFilterQueryVariables = {
  // @ts-expect-error The variable is non-null.
  filter: null,
}
