import type * as T from './result'

// The tags have the fields of all selections, also inside map().
type Article = NonNullable<T.NestedSpreadQuery['article']>
export const tags = (article: Article): string[] =>
  article.tags.map((tag) => tag.id + tag.label)

type ArticleWithFragment = NonNullable<
  T.NestedSpreadAndFragmentQuery['article']
>
export const tagsWithFragment = (article: ArticleWithFragment): string[] =>
  article.tags.map((tag) => tag.id + tag.label)

type ArticleWithTitle = NonNullable<
  T.NestedSpreadWithOtherFieldsQuery['article']
>
export const titleAndTags = (article: ArticleWithTitle): string[] =>
  article.tags.map((tag) => article.title + tag.id + tag.label)

// The ids are only there if the spread is included.
type ConditionalArticle = NonNullable<T.ConditionalNestedSpreadQuery['article']>
export const conditionalTags = (article: ConditionalArticle): string[] =>
  article.tags.map((tag) => (tag.id ?? '') + tag.label)
export const withoutIds: ConditionalArticle = { tags: [{ label: 'News' }] }
