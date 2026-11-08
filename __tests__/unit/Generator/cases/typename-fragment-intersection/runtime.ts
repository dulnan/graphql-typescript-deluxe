import type * as T from './result'

type Page = NonNullable<T.ObjectTwoFragmentsQuery['getHomepage']>
export const page: Page = {
  __typename: 'NodePage',
  title: 'Home',
  body: 'Text',
}
// The fields of both fragments can be read.
export const title: Page['title'] = page.title
export const body: Page['body'] = page.body
// @ts-expect-error The fields of both fragments are there.
export const pageWithoutTitle: Page = { __typename: 'NodePage', body: 'Text' }

type PageWithId = NonNullable<T.ObjectInterfaceFragmentQuery['getHomepage']>
export const pageWithId: PageWithId = {
  __typename: 'NodePage',
  id: '1',
  title: 'Home',
}
// @ts-expect-error The field of the interface fragment is there too.
export const pageWithoutId: PageWithId = {
  __typename: 'NodePage',
  title: 'Home',
}

type ConditionalPage = NonNullable<
  T.ObjectConditionalFragmentQuery['getHomepage']
>
export const withoutTitle: ConditionalPage = {
  __typename: 'NodePage',
  body: 'Text',
}
export const conditionalTitle: ConditionalPage['title'] = undefined

export const entity: T.AbstractTwoFragmentsQuery['getRandomEntity'] = {
  __typename: 'NodePage',
  title: 'Home',
  body: 'Text',
}
export const otherEntity: T.AbstractTwoFragmentsQuery['getRandomEntity'] = {
  __typename: 'User',
}
type Entity = T.AbstractTwoFragmentsQuery['getRandomEntity']
// @ts-expect-error A page has the fields of both fragments.
export const entityWithoutTitle: Entity = {
  __typename: 'NodePage',
  body: 'Text',
}
