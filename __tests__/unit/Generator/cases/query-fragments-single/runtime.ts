import type { QueryFragmentsSingleQuery } from './result'

export default function (query: QueryFragmentsSingleQuery): void {
  const entity = query.getRandomEntity

  if (!entity) {
    return
  }

  // The entity is MediaImageFragment | object
  // We need to narrow the type to access MediaImageFragment fields

  // Use 'in' operator to narrow to MediaImageFragment
  if ('id' in entity) {
    // Now entity is narrowed to MediaImageFragment
    console.log(entity.id)
  }

  // @ts-expect-error - Cannot access 'id' without narrowing (object doesn't have id)
  console.log(entity.id)
}
