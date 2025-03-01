import type { FieldMergingNestedComplexQuery } from './result.js'

export default function (query: FieldMergingNestedComplexQuery) {
  const entity = query.entityById

  if (!entity) {
    return
  }

  if (entity.__typename === 'NodeArticle' && entity.categories) {
    const firstCategory = entity.categories[0]
    if (!firstCategory) {
      return
    }
    if (!firstCategory.related) {
      return
    }
    const firstRelated = firstCategory.related[0]

    if (!firstRelated) {
      return
    }

    if ('title' in firstRelated) {
      console.log(firstRelated.title)
      console.log(firstRelated.id)
      console.log(firstRelated.body)
    }

    if ('body' in firstRelated) {
      console.log(firstRelated.title)
      console.log(firstRelated.id)
      console.log(firstRelated.body)
    }

    if ('id' in firstRelated) {
      console.log(firstRelated.id)
      // @ts-expect-error Could be Entity, so title is not available.
      console.log(firstRelated.title)
      // @ts-expect-error Could be Entity, so body is not available.
      console.log(firstRelated.body)
    }
  }
}
