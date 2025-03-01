import type { InlineFieldsQuery } from './result'

export default function (query: InlineFieldsQuery): void {
  const foo = query.foobar
  if (!foo) {
    return
  }
  if (foo.__typename === 'NodePage') {
    console.log(foo.body_alias)
  }
}
