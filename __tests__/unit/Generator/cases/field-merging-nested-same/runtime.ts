import type { FieldMergingNestedQuery } from './result.js'

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
