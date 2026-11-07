import type * as T from './result'

// Real responses must be assignable, including the fields of the fragments.
export const dispatchArticle: T.DispatchFragmentQuery = {
  getRandomEntity: {
    __typename: 'NodeArticle',
    id: '1',
    body: 'Text',
    tags: ['news'],
  },
}
export const dispatchPage: T.DispatchFragmentQuery = {
  getRandomEntity: { __typename: 'NodePage', id: '1', title: 'Home' },
}
export const dispatchUser: T.DispatchFragmentQuery = {
  getRandomEntity: { __typename: 'User', id: '1' },
}
export const wrapper: T.WrapperFragmentQuery = {
  search: [{ __typename: 'MediaVideo', id: '1', entityType: 'MEDIA' }],
}
export const objectInlineInterface: T.ObjectInlineInterfaceQuery = {
  getHomepage: { id: '1', title: 'Home' },
}
export const abstractInlineInterfacePage: T.AbstractInlineInterfaceQuery = {
  getRandomEntity: { __typename: 'NodePage', id: '1', body: 'Text' },
}
export const abstractInlineInterfaceUser: T.AbstractInlineInterfaceQuery = {
  getRandomEntity: { __typename: 'User', id: '1' },
}

export default function (
  dispatch: T.DispatchFragmentQuery,
  wrapper: T.WrapperFragmentQuery,
  objectInlineInterface: T.ObjectInlineInterfaceQuery,
  objectInlineInterfaceOtherType: T.ObjectInlineInterfaceOtherTypeQuery,
  abstractInlineInterface: T.AbstractInlineInterfaceQuery,
): void {
  // The fields of the fragments are available on their types.
  const entity = dispatch.getRandomEntity
  if (entity?.__typename === 'NodeArticle') {
    console.log(entity.body, entity.tags)
  } else if (entity?.__typename === 'NodePage') {
    const title: string = entity.title
    console.log(title)
  }

  const entityType = wrapper.search?.[0]?.entityType
  console.log(entityType)

  const title: string | undefined = objectInlineInterface.getHomepage?.title
  console.log(title)

  // The fragment on NodeArticle does not apply to the homepage.
  // @ts-expect-error The field is not selected.
  console.log(objectInlineInterfaceOtherType.getHomepage?.body)

  const page = abstractInlineInterface.getRandomEntity
  if (page?.__typename === 'NodePage') {
    console.log(page.body)
  }
}
