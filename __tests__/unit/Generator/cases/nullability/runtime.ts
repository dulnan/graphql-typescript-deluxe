import type { NullabilityQuery } from './result'

export function testQuery(query: NullabilityQuery): void {
  // @ts-expect-error Both array and array item is nullable.
  console.log(query.nullableArray.at(0).id)

  const item = query.fullyNonNullableArray[0]
  if (!item) {
    return
  }
  console.log(item.id)

  const possiblyNull = query.nonNullableArray[0]
  // @ts-expect-error Array item can be null.
  console.log(possiblyNull.id)
}
