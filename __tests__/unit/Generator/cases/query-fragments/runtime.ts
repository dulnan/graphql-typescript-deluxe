import type { QueryFragmentsQuery } from './result'

export default function (query: QueryFragmentsQuery): void {
  const entity = query.getRandomEntity

  if (!entity) {
    return
  }

  console.log(entity.id)

  if (entity.__typename === 'NodePage') {
    console.log(entity.id)
    console.log(entity.__typename === 'NodePage')
    console.log(entity.title)
  } else if (entity.__typename === 'NodeArticle') {
    console.log(entity.body)
  }
}
