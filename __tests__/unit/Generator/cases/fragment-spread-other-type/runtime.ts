import type * as T from './result'

type Equal<A, B> =
  (<V>() => V extends A ? 1 : 2) extends <V>() => V extends B ? 1 : 2
    ? true
    : false

// A page only has the id.
export const page: Equal<
  NonNullable<T.PageQuery['getHomepage']>,
  { id: string }
> = true

export const pageWithField: Equal<
  keyof NonNullable<T.PageWithFieldQuery['getHomepage']>,
  'id' | 'title'
> = true

// An article also has the author.
type Article = Extract<
  NonNullable<T.SearchArticleQuery['search']>[number],
  { author: unknown }
>
export const articleAuthor = (article: Article): string | undefined =>
  article.author.name
