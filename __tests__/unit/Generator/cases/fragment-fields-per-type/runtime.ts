import type * as T from './result'

// Real responses for a page must be assignable.
export const pageLinkId: T.PageLinkIdQuery = {
  page: { link: { url: 'https://example.com' } },
}
export const pageArticleLink: T.PageArticleLinkQuery = {
  page: { link: { url: 'https://example.com' } },
}

export default function (
  articleLinkId: T.ArticleLinkIdQuery,
  articleArticleLink: T.ArticleArticleLinkQuery,
): void {
  // The fragment always selects the id of the link of an article.
  const link = articleLinkId.article?.link
  if (link) {
    const id: string | number = link.id
    console.log(id)
  }

  const linkWithLabel = articleArticleLink.article?.link
  if (linkWithLabel) {
    const id: string | number = linkWithLabel.id
    console.log(id)
  }
}
