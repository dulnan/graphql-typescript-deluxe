import type { DirectivesIncludeQuery } from './result.js'

export default function (query: DirectivesIncludeQuery): void {
  const entity = query.getRandomEntity
  if (!entity) {
    return
  }

  if ('authorOptional' in entity) {
    // @ts-expect-error Can be undefined or null.
    console.log(entity.categories[0])

    // Is always present, because it has no directive.
    console.log(entity.authorRequired.email)

    // @ts-expect-error Can be undefined or null due to the @include directive.
    console.log(entity.authorOptional.email)
  }
}
