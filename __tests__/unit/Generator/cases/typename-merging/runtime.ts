import type { TypenameMergingQuery } from './result.js'

export default function (query: TypenameMergingQuery) {
  const withTypename = query.withTypename
  if (!withTypename) {
    return
  }

  if (withTypename.__typename === 'NodePage') {
    console.log(withTypename.__typename === 'NodePage')
    console.log(withTypename.id)
    console.log(withTypename.body)
  } else if (withTypename.__typename === 'NodeArticle') {
    console.log(withTypename.tags)
    console.log(withTypename.title)
    console.log(withTypename.id)
  } else {
    // @ts-expect-error Can't ever be this, since we narrowed it.
    console.log(withTypename.__typename === 'NodePage')
    console.log(withTypename.id)
    // @ts-expect-error Only available on NodePage.
    console.log(withTypename.body)
  }
}
