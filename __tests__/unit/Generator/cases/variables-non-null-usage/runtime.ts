import type * as T from './result'

// The variables may be left out.
export const directive: T.DirectiveQueryVariables = {}
export const inputValues: T.InputValuesQueryVariables = {}
export const argumentDefault: T.ArgumentDefaultQueryVariables = {}

// A variable used where null is allowed can be null.
export const nullable: T.NullableQueryVariables = { text: null }

// @ts-expect-error The variable is used in @include(if:).
export const directiveNull: T.DirectiveQueryVariables = { withBody: null }

// @ts-expect-error The variable is used for a non-null input field.
export const languageNull: T.InputValuesQueryVariables = { language: null }

// @ts-expect-error The variable is used for a non-null list item.
export const tagNull: T.InputValuesQueryVariables = { tag: null }

// @ts-expect-error The variable is used for a non-null argument.
export const limitNull: T.ArgumentDefaultQueryVariables = { limit: null }
