import type { FieldMergingQuery } from './result.js'

export default function (v: FieldMergingQuery) {
  if (!v) {
    return
  }
  const entity = v.getHomepage
  if (!entity) {
    return
  }

  console.log(entity.id)
  console.log(entity.body)
  console.log(entity.title)
}
