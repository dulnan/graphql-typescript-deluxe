import type * as T from './result'

type Equal<A, B> =
  (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2
    ? true
    : false

// A conditional inline fragment produces the same type as putting the
// directive on each of its fields.
export const inlineObject: Equal<
  T.InlineObjectQuery,
  T.InlineObjectFieldsQuery
> = true
export const inlineObjectNoTypeCondition: Equal<
  T.InlineObjectNoTypeConditionQuery,
  T.InlineObjectFieldsQuery
> = true
export const overlapInline: Equal<
  T.OverlapInlineQuery,
  T.OverlapInlineFieldsQuery
> = true
export const inlineAbstract: Equal<
  T.InlineAbstractQuery,
  T.InlineAbstractFieldsQuery
> = true

// Real responses when the fragments are not included must be assignable.
export const spreadObject: T.SpreadObjectQuery = { getHomepage: { id: '1' } }
export const spreadObjectOnly: T.SpreadObjectOnlyQuery = { getHomepage: {} }
export const spreadObjectTypename: T.SpreadObjectTypenameQuery = {
  getHomepage: { id: '1' },
}
export const overlapSpread: T.OverlapSpreadQuery = {
  getMenu: { links: [{ link: { label: 'Home' } }] },
}
export const overlapTwoSpreadsX: T.OverlapTwoSpreadsQuery = {
  getMenu: { name: 'main', links: [{ link: { url: '/' } }] },
}
export const overlapTwoSpreadsY: T.OverlapTwoSpreadsQuery = {
  getMenu: { links: [{ link: { label: 'Home' } }] },
}
export const spreadAbstract: T.SpreadAbstractQuery = {
  getRandomEntity: { __typename: 'NodePage', id: '1' },
}
export const spreadAbstractOnly: T.SpreadAbstractOnlyQuery = {
  getNonNullEntity: {},
}
export const inlineAbstractWithSpread: T.InlineAbstractWithSpreadQuery = {
  getRandomEntity: { __typename: 'NodePage', id: '1' },
}
export const spreadAbstractOnAbstract: T.SpreadAbstractOnAbstractQuery = {
  getNonNullEntity: { __typename: 'User' },
}
export const rootSpread: T.RootSpreadQuery = {}
export const rootInline: T.RootInlineQuery = {}
export const rootSpreadOverlap: T.RootSpreadOverlapQuery = {
  getNonNullEntity: { id: '1' },
}

// Real responses when the fragments are included must be assignable.
export const spreadObjectIncluded: T.SpreadObjectQuery = {
  getHomepage: { id: '1', title: 'Home', body: 'Text' },
}
export const overlapSpreadIncluded: T.OverlapSpreadQuery = {
  getMenu: { name: 'main', links: [{ link: { label: 'Home', url: '/' } }] },
}
export const rootSpreadOverlapIncluded: T.RootSpreadOverlapQuery = {
  getNonNullEntity: { id: '1', entityType: 'NODE' },
}

export default function (
  spreadObject: T.SpreadObjectQuery,
  overlapSpread: T.OverlapSpreadQuery,
  rootSpreadOverlap: T.RootSpreadOverlapQuery,
): void {
  // The fields of a conditional spread are available, but optional.
  const title: string | undefined = spreadObject.getHomepage?.title
  console.log(title)

  // Fields selected without a condition are required.
  const label: string | undefined = overlapSpread.getMenu?.links[0]?.link.label
  const id: string = rootSpreadOverlap.getNonNullEntity.id
  console.log(label, id)
}
