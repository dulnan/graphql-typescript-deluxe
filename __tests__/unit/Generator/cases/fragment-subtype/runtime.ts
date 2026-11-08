import type * as T from './result'

type Page = NonNullable<T.HomepageQuery['getHomepage']>
// The fields of the fragment for pages can be read.
export const pageBody = (page: Page): string | undefined => page.body
export const page: Page = { title: 'Home', id: '1', body: 'Text' }
// @ts-expect-error A page doesn't have the fields of the fragment for users.
export const pageWithName: Page = { title: 'Home', id: '1', name: 'Jane' }

type OnlySpread = NonNullable<T.HomepageOnlySpreadQuery['getHomepage']>
export const onlySpreadBody = (page: OnlySpread): string | undefined =>
  page.body

// The fields of a conditional spread may be missing.
type Conditional = NonNullable<T.HomepageConditionalQuery['getHomepage']>
export const conditionalBody = (page: Conditional): string | undefined =>
  page.body
export const withoutDetails: Conditional = { title: 'Home' }

type Nested = NonNullable<T.HomepageNestedQuery['getHomepage']>
export const nestedBody = (page: Nested): string | undefined => page.body

// The subtype is assignable to the fragment type.
export const toFragment = (page: Page): T.PageOrUserFragment => page

// On an interface field, the user branch is still there.
type Entity = NonNullable<T.RandomEntityQuery['getRandomEntity']>
export const user: Entity = { id: '1', name: 'Jane' }
