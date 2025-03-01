import type { TestQuery } from './result'

export default function (v: TestQuery): void {
  const entity = v?.getRandomEntity
  if (!entity) {
    return
  }

  console.log(entity.id)

  // @ts-expect-error Not available on Entity.
  console.log(entity.title)

  if ('title' in entity) {
    console.log(entity.id)
    console.log(entity.title)
  }
}
