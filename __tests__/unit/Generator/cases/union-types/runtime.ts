import type { UnionTypesQuery } from './result.js'

export default function (query: UnionTypesQuery) {
  const items = query.search
  if (!items) {
    return
  }
  const first = items[0]

  if (first.__typename === 'NodeArticle') {
    console.log(first.body)
  } else if (first.__typename === 'MediaVideo') {
    console.log(first.videoUrl)
  }
}
