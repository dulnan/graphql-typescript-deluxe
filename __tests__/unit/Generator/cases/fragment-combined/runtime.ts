import type { TestQuery } from './result'

export function testType(query: TestQuery): void {
  if (!query.getRandomEntity) {
    return
  }
  // Available because it's on Entity.
  console.log(query.getRandomEntity.entityType)
  console.log(query.getRandomEntity.id)

  // Narrowing for Node.
  if ('title' in query.getRandomEntity) {
    console.log(query.getRandomEntity.title)
  }

  // Narrowing for NodePage.
  if ('body' in query.getRandomEntity) {
    console.log(query.getRandomEntity.title)
    console.log(query.getRandomEntity.body)
  }
}
