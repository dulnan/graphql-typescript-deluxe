import type * as T from './result'

type Equal<A, B> =
  (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2
    ? true
    : false

// An inline fragment without a type condition must produce exactly the same
// type as an inline fragment with the parent type as its type condition.
export const objectField: Equal<T.ObjectFieldQuery, T.ObjectFieldTypedQuery> =
  true

export const interfaceField: Equal<
  T.InterfaceFieldQuery,
  T.InterfaceFieldTypedQuery
> = true

export const interfaceFieldWithSpread: Equal<
  T.InterfaceFieldWithSpreadQuery,
  T.InterfaceFieldWithSpreadTypedQuery
> = true

export const unionField: Equal<T.UnionFieldQuery, T.UnionFieldTypedQuery> = true

export const rootType: Equal<T.RootTypeQuery, T.RootTypeTypedQuery> = true

export const fragment: Equal<T.EntityIdFragment, T.EntityIdTypedFragment> = true

export default function (
  objectFieldQuery: T.ObjectFieldQuery,
  interfaceFieldWithSpreadQuery: T.InterfaceFieldWithSpreadQuery,
): void {
  // The fields from the inline fragment are available.
  console.log(objectFieldQuery.getHomepage?.title)

  // The fields from the spread inside the inline fragment are available.
  console.log(interfaceFieldWithSpreadQuery.getRandomEntity?.entityType)
}
