import type { NullabilityQuery } from './result'

export function testQuery(query: NullabilityQuery): void {
  // @ts-expect-error Can be null
  console.log(query.nullableArray[0])

  if (query.nullableArray) {
    const item = query.nullableArray[0]
    // @ts-expect-error Array can contain null.
    console.log(item.nullableId)

    if (item) {
      console.log(item.nullableId)
      console.log(item.nonNullableId)

      // @ts-expect-error can be null
      console.log(item.nullableId.split(''))
    }
  }

  console.log(query.nonNullableArray)
  const item = query.nonNullableArray[0]

  // @ts-expect-error Item can be null
  console.log(item.nullableId)

  if (item) {
    console.log(item.nullableId)
  }

  const first = query.fullyNonNullableArray[0]
  if (first !== undefined) {
    console.log(first.nullableId)
    console.log(first.nonNullableId)
  }
}
