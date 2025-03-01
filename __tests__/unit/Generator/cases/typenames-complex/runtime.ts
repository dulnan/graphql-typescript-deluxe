import type { TypenamesComplexQuery } from './result.js'

export default function (query: TypenamesComplexQuery) {
  const foo = query.one
  if (foo && '__typename' in foo && foo.__typename === 'NodePage') {
    console.log(foo.body_alias)
  }
}
