import type {
  FieldMergingNestedQuery,
  NodeArticleOneFragment,
  NodeArticleTwoFragment,
} from './result'

type Intersected = NodeArticleOneFragment & NodeArticleTwoFragment

export function testIntersection(node: Intersected): void {
  const categories = node.categories
  const category = categories?.at(0)
  if (!category) {
    return
  }
  console.log(category.label)
  // @ts-expect-error Not available because TS can't intersect nested array types.
  console.log(category.url)
}

export function custom(v: FieldMergingNestedQuery): void {
  const entity = v.entityById
  if (!entity) {
    return
  }
  if (!('categories' in entity)) {
    return
  }
  console.log(entity.title)
  console.log(entity.tags)
  if (entity.categories) {
    const category = entity.categories.at(0)
    if (!category) {
      return
    }
    console.log(category.label)
    console.log(category.url)
  }
}
