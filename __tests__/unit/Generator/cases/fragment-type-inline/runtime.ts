import type { TestQuery } from './result.js'

export default function (v: TestQuery) {
  const entity = v?.getRandomEntity
  if (!entity) {
    return
  }

  // Target Node.
  if ('title' in entity) {
    console.log(entity.title)
    // @ts-expect-error Only available on NodePage.
    console.log(entity.body)
  }

  // Target NodePage.
  if ('body' in entity) {
    console.log(entity.id)
    console.log(entity.title)
    console.log(entity.body)
    // @ts-expect-error Only available on NodeArticle.
    console.log(entity.categories)
  }

  // Target NodeArticle.
  if ('categories' in entity) {
    console.log(entity.categories)
    console.log(entity.title)
    // @ts-expect-error Only available on NodePage.
    console.log(entity.body)
    // @ts-expect-error Only available on NodePage.
    console.log(entity.id)
  }
}
