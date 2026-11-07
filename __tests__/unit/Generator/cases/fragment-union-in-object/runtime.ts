import type * as T from './result'

// Real responses must be assignable, including the type specific fields.
export const interfaceFragment: T.InterfaceFragmentQuery = {
  getHomepage: { __typename: 'NodePage', title: 'Home', id: '1', body: 'Text' },
}
export const unionFragment: T.UnionFragmentQuery = {
  getRandomEntity: { __typename: 'NodeArticle', title: 'News', body: 'Text' },
}

export default function (
  interfaceFragment: T.InterfaceFragmentQuery,
  unionFragment: T.UnionFragmentQuery,
): void {
  const page = interfaceFragment.getHomepage
  if (page) {
    // The fields of the fragment's branch for the type are available.
    const body: string | undefined = page.body
    const id: string = page.id
    // The __typename is the one of the object type.
    const typename: 'NodePage' = page.__typename
    console.log(body, id, typename)
    // @ts-expect-error Only selected for User.
    console.log(page.name)
  }

  const entity = unionFragment.getRandomEntity
  if (entity && '__typename' in entity && entity.__typename === 'NodeArticle') {
    const body: string | undefined = entity.body
    console.log(body)
  }
}
