import type { NestedQuery } from './result'

export default function (query: NestedQuery): void {
  const entity = query.getRandomEntity
  if (!entity) {
    return
  }
  // Available always.
  console.log(entity.id)

  if ('body' in entity) {
    console.log(entity.id)
    console.log(entity.body)
    console.log(entity.categories)

    const categories = entity.categories
    if (!categories) {
      return
    }
    const first = categories[0]
    if (!first) {
      return
    }
    console.log(first.label)

    const related = first.related
    if (!related) {
      return
    }

    const firstRelated = related[0]
    if (!firstRelated) {
      return
    }
    console.log(firstRelated.id)

    if (firstRelated.__typename === 'NodePage') {
      console.log(firstRelated.id)
    } else if (firstRelated.__typename === 'MediaImage') {
      console.log(firstRelated.id)
    } else if (firstRelated.__typename === 'NodeArticle') {
      console.log(firstRelated.id)
      console.log(firstRelated.body)
      console.log(firstRelated.title)
    }
  }
}
