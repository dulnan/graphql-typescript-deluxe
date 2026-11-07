import type * as T from './result'

// Real responses must be assignable.
export const objectType: T.ObjectTypeQuery = {
  getHomepage: { kind: 'NodePage', title: 'Home' },
}
export const objectTypeWithTypename: T.ObjectTypeWithTypenameQuery = {
  getHomepage: { __typename: 'NodePage', kind: 'NodePage' },
}
export const rootType: T.RootTypeQuery = { type: 'Query' }
export const interfaceType: T.InterfaceTypeQuery = {
  getRandomEntity: { kind: 'Domain', id: '1' },
}
export const interfaceTypeWithTypename: T.InterfaceTypeWithTypenameQuery = {
  getRandomEntity: { __typename: 'User', kind: 'User', name: 'Jane' },
}
export const unionType: T.UnionTypeQuery = {
  search: [{ kind: 'NodeArticle', body: 'Text' }, { kind: 'MediaVideo' }],
}
export const fragment: T.EntityKindFragment = {
  kind: 'Domain',
  label: 'example.com',
}

export default function (
  interfaceTypeWithInlineFragment: T.InterfaceTypeWithInlineFragmentQuery,
  unionType: T.UnionTypeQuery,
  entityKind: T.EntityKindFragment,
): void {
  // The alias narrows the type.
  const entity = interfaceTypeWithInlineFragment.getRandomEntity
  if (entity?.kind === 'User') {
    console.log(entity.name)
  }

  const item = unionType.search?.[0]
  if (item?.kind === 'NodeArticle') {
    console.log(item.body)
  }

  if (entityKind.kind === 'Domain') {
    const label: string = entityKind.label
    console.log(label)
  }
}
