import type { NullabilityQuery } from './result.js'

export function testQuery(query: NullabilityQuery) {
  // @ts-expect-error Both array and array item is nullable.
  console.log(query.nullableArray.at(0).id)

  const item = query.fullyNonNullableArray[0]
  console.log(item.id)

  const possiblyNull = query.nonNullableArray[0]
  // @ts-expect-error Array item can be null.
  console.log(possiblyNull.id)
}
