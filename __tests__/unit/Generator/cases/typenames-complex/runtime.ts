import type { TypenamesComplexQuery } from './result'

export default function (query: TypenamesComplexQuery): void {
  const foo = query.one
  if (foo && '__typename' in foo && foo.__typename === 'NodePage') {
    console.log(foo.body_alias)
  }
}
