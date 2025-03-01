import type { FieldMergingDeepNestedQuery } from './result.js'

export default function (query: FieldMergingDeepNestedQuery): void {
  const route = query.route

  if (!route) {
    return
  }

  if (route.__typename === 'DefaultEntityUrl') {
    // @ts-expect-error Only available on NodePage.
    console.log(route.entity?.title)
    console.log(route.entity?.id)

    if (route.entity.__typename === 'NodeArticle') {
      console.log(route.entity.id)
      console.log(route.entity.body)
      // @ts-expect-error Only available on NodePage.
      console.log(route.entity.title)
    } else if (route.entity.__typename === 'NodePage') {
      console.log(route.entity.title)
      // @ts-expect-error Only available on NodeArticle.
      console.log(route.entity.body)
    } else if (route.entity.__typename === 'Image') {
      console.log(route.entity.id)
      // @ts-expect-error Only available on NodePage.
      console.log(route.entity.title)
      // @ts-expect-error Only available on NodeArticle.
      console.log(route.entity.body)
      // @ts-expect-error Field not requested.
      console.log(route.entity.imageUrl)
    }
  }
}
