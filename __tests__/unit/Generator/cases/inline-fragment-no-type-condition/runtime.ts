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

// An inline fragment on the parent type is the same as selecting its fields
// directly, so __typename narrows to each type.
export const unionFieldDirect: Equal<
  T.UnionFieldTypedQuery,
  T.UnionFieldDirectQuery
> = true

export const interfaceTypename: Equal<
  T.InterfaceTypenameQuery,
  T.InterfaceTypenameTypedQuery
> = true

export const interfaceTypenameDirect: Equal<
  T.InterfaceTypenameTypedQuery,
  T.InterfaceTypenameDirectQuery
> = true

type SearchResult = NonNullable<T.UnionFieldTypedQuery['search']>[number]
export const articleBody = (result: SearchResult): string | undefined =>
  result.__typename === 'NodeArticle' ? result.body : undefined
export const videoWithBody: SearchResult = {
  __typename: 'MediaVideo',
  // @ts-expect-error Only an article has a body.
  body: '',
}

type Entity = NonNullable<T.InterfaceTypenameTypedQuery['getRandomEntity']>
export const pageTitle = (entity: Entity): string | undefined =>
  entity.__typename === 'NodePage' ? entity.title : undefined
// @ts-expect-error Only a page has a title.
export const userWithTitle: Entity = { __typename: 'User', title: '' }

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
