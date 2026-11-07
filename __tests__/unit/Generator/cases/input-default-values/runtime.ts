import type * as T from './result'

// Variables and input fields with a default value may be left out.
export const searchWithDefaults: T.SearchWithDefaultsQueryVariables = {}
export const requiredFilter: T.RequiredFilterQueryVariables = {
  filter: { nested: {} },
}
export const nullableWithDefault: T.NullableWithDefaultQueryVariables = {}
export const includeWithDefault: T.IncludeWithDefaultQueryVariables = {}

// They can also be passed.
export const searchWithValues: T.SearchWithDefaultsQueryVariables = {
  filter: { language: 'de', tags: ['news'], sort: null },
  page: 2,
}

// A non-null variable or field with a default can't be null.
export const pageNull: T.SearchWithDefaultsQueryVariables = {
  // @ts-expect-error The variable is non-null.
  page: null,
}
export const languageNull: T.RequiredFilterQueryVariables = {
  // @ts-expect-error The field is non-null.
  filter: { language: null },
}
