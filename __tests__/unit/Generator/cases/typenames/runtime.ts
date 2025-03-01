import type { InlineFieldsQuery } from './result.js'

export default function (query: InlineFieldsQuery) {
  const foo = query.foobar
  if (!foo) {
    return
  }
  if (foo.__typename === 'NodePage') {
    console.log(foo.body_alias)
  }
}
