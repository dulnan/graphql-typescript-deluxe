import type { FieldMergingDeepNestedFragment } from './result'

export default function (query: FieldMergingDeepNestedFragment): void {
  const route = query.route

  if (!route) {
    return
  }

  console.log(route.entity?.id)
}
