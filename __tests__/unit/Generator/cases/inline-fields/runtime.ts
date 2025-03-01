import type { InlineFieldsQuery } from './result.js'

export default function (query: InlineFieldsQuery) {
  const entity = query.getRandomEntity
  if (!entity) {
    return
  }

  console.log(entity.id)

  if ('body' in entity) {
    console.log(entity.body)
    console.log(entity.id)
    console.log(entity.__typename)
  }
}
