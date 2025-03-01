import type { InlineFieldsQuery } from './result'

export default function (query: InlineFieldsQuery): void {
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
