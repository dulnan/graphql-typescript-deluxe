import type { StressTestQuery } from './result.js'

export default function (v: StressTestQuery) {
  const entity = v.entityById
  if (!entity) {
    return
  }

  if ('title' in entity) {
    console.log(entity.title)
  }

  if ('categories' in entity) {
    console.log(entity.title)
    console.log(entity.categories)

    const categories = entity.categories
    if (!categories) {
      return
    }

    const category = categories[0]

    if (!category) {
      return
    }

    console.log(category.url)
    console.log(category.label)
  }
}
