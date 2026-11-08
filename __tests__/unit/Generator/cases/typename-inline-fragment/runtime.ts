import type * as T from './result'

type Equal<A, B> =
  (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2
    ? true
    : false

// A __typename in an inline fragment or fragment on an abstract type is the
// same as one selected directly.
export const conditionalOnParent: Equal<
  T.ConditionalOnParentQuery['search'],
  T.ConditionalDirectQuery['search']
> = true

export const onOtherInterface: Equal<
  T.OnOtherInterfaceQuery['search'],
  T.DirectQuery['search']
> = true

export const fragmentOnOtherInterface: Equal<
  T.FragmentOnOtherInterfaceQuery['search'],
  T.DirectQuery['search']
> = true

// The __typename narrows the type.
type SearchResult = NonNullable<T.OnOtherInterfaceQuery['search']>[number]
export const articleBody = (result: SearchResult): string | undefined =>
  result.__typename === 'NodeArticle' ? result.body : undefined
export const videoWithBody: SearchResult = {
  __typename: 'MediaVideo',
  // @ts-expect-error Only an article has a body.
  body: '',
}
export const pageResult: SearchResult = {
  // @ts-expect-error A page is not a search result.
  __typename: 'NodePage',
}

type ConditionalResult = NonNullable<
  T.ConditionalOnParentQuery['search']
>[number]
export const conditionalBody = (
  result: ConditionalResult,
): string | undefined =>
  result.__typename === 'NodeArticle' ? result.body : undefined
export const withoutTypename: ConditionalResult = {}

// Only the branch of an image has the image field.
type WithSubtype = NonNullable<T.OnInterfaceWithSubtypeQuery['getRandomEntity']>
export const imageBranch: Equal<
  Extract<WithSubtype, { __typename: 'MediaImage' }>['image'],
  string | undefined
> = true
export const videoBranch: Equal<
  keyof Extract<WithSubtype, { __typename: 'MediaVideo' }>,
  '__typename'
> = true

export const page: Equal<
  NonNullable<T.ObjectWithInterfaceQuery['getHomepage']>['__typename'],
  'NodePage'
> = true
