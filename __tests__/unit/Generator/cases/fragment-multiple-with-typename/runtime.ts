import type { NodeArticleRootFragment } from './result'

export default function (node: NodeArticleRootFragment): void {
  const category = node.categories?.at(0)
  if (!category) {
    return
  }

  const related = category.related

  const first = related?.at(0)

  if (!first) {
    return
  }

  console.log(first.__typename)

  if (first.__typename === 'NodeArticle') {
    console.log(first.tags)
    console.log(first.body)
    // @ts-expect-error Only exists on NodePage.
    console.log(first.title)
  } else if (first.__typename === 'NodePage') {
    console.log(first.title)
    console.log(first.pageId)
    // @ts-expect-error Only exists on NodeArticle.
    console.log(first.body)
  } else if (first.__typename === 'MediaVideo') {
    console.log(first.__typename)
  }
}
