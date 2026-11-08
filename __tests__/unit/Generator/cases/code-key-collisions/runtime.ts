import type * as T from './result'

// The typename literal and the Maybe helper exist, although a fragment has
// the same name.
export const page: T.CodeKeyCollisionsQuery = {
  getHomepage: { __typename: 'NodePage', title: 'Home', body: null },
}
export const empty: T.CodeKeyCollisionsQuery = { getHomepage: null }

export const wrongTypename: T.CodeKeyCollisionsQuery = {
  // @ts-expect-error The typename is a literal.
  getHomepage: { __typename: 'NodeArticle', title: 'Home', body: null },
}
