import type * as T from './result'

type Equal<A, B> =
  (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2
    ? true
    : false

type Result = NonNullable<T.ConflictQuery['search']>[number]
type NestedResult = NonNullable<T.ConflictNestedQuery['search']>[number]

// A video has no author.
export const video: Result = { id: '1', entityType: 'MEDIA' }

// Where there is an author, it has the name of the first fragment.
export const authorName: Equal<NonNullable<Result['author']>['name'], string> =
  true
export const nestedAuthorName: Equal<
  NonNullable<NestedResult['author']>['name'],
  string
> = true

// The email is nullable in the schema.
export const authorEmail: Equal<
  NonNullable<Result['author']>['email'],
  string | undefined
> = true
