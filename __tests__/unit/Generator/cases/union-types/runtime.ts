import type { UnionTypesQuery } from './result'

export default function (query: UnionTypesQuery): void {
  const items = query.search
  if (!items) {
    return
  }
  const first = items[0]
  if (!first) {
    return
  }

  if (first.__typename === 'NodeArticle') {
    console.log(first.body)
  } else if (first.__typename === 'MediaVideo') {
    console.log(first.videoUrl)
  }
}
