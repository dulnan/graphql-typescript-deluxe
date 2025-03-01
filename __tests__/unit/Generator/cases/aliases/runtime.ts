import type { InlineFieldsQuery } from './result.js'

export default function (query: InlineFieldsQuery) {
  // Available on Entity
  console.log(query.alias_getRandomEntity)
  if (!query.alias_getRandomEntity) {
    return
  }
  console.log(query.alias_getRandomEntity.alias_id)

  if ('alias_title' in query.alias_getRandomEntity) {
    console.log(query.alias_getRandomEntity.alias_id)
    console.log(query.alias_getRandomEntity.alias_title)
  }
}
