import type { FieldMergingDeepNestedQuery } from './result.js'

export default function (query: FieldMergingDeepNestedQuery): void {
  const route = query.route

  if (!route) {
    return
  }

  if (route.__typename === 'DefaultEntityUrl') {
    console.log(route.metatags)
    console.log(route.entity?.id)
    if (route.metatags) {
      const first = route.metatags.at(0)
      if (first) {
        console.log(first.id)
        console.log(first.tag)
        console.log(first.attributes)
        const firstAttribtue = first.attributes.at(0)
        if (firstAttribtue) {
          console.log(firstAttribtue.key)
          console.log(firstAttribtue.value)
        }
      }
    }
  } else if (route.__typename === 'DefaultInternalUrl') {
    console.log(route.routeName)
    console.log(route.metatags)
  } else if (route.__typename === 'DefaultUrl') {
    console.log(route.__typename)
    // @ts-expect-error Only available on EntityUrl.
    console.log(route.entity)
    // @ts-expect-error Only available on EntityUrl.
    console.log(route.metatags)
  }
}
