import type { FieldMergingTypenameQuery } from './result'

export default function (query: FieldMergingTypenameQuery): void {
  const route = query.route

  if (!route) {
    return
  }

  console.log(route.__typename)

  if (route.__typename === 'DefaultEntityUrl') {
    console.log(route.path)
    console.log(route.foobar)
    console.log(route.routeName)
  }

  if ('path' in route) {
    console.log(route.__typename)
    console.log(route.path)
    console.log(route.foobar)
  }
}
