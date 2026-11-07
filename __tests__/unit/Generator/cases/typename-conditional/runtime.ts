import type * as T from './result'

// Real responses without the __typename must be assignable.
export const object: T.ObjectQuery = { getHomepage: { title: 'Home' } }
export const objectSkip: T.ObjectSkipQuery = { getHomepage: { title: 'Home' } }
export const objectAlias: T.ObjectAliasQuery = {
  getHomepage: { title: 'Home' },
}
export const root: T.RootQuery = { isAvailable: true }
export const abstract: T.AbstractQuery = { getRandomEntity: { id: '1' } }
export const abstractWithBranches: T.AbstractWithBranchesQuery = {
  getRandomEntity: { name: 'Jane' },
}
export const abstractPlusInline: T.AbstractPlusInlineQuery = {
  getRandomEntity: {},
}
export const union: T.UnionQuery = { search: [{ title: 'News' }, {}] }
export const fragmentInObject: T.FragmentInObjectQuery = {
  getHomepage: { id: '1', title: 'Home' },
}
export const onlyTypenameAndSpreads: T.OnlyTypenameAndSpreadsQuery = {
  getHomepage: { title: 'Home', body: 'Text' },
}

export default function (
  objectPlusPlain: T.ObjectPlusPlainQuery,
  abstractWithBranches: T.AbstractWithBranchesQuery,
  abstractPlusInline: T.AbstractPlusInlineQuery,
): void {
  // The plain selection is always included.
  if (objectPlusPlain.getHomepage) {
    const typename: 'NodePage' = objectPlusPlain.getHomepage.__typename
    console.log(typename)
  }

  // A conditional __typename still narrows the type.
  const entity = abstractWithBranches.getRandomEntity
  if (entity?.__typename === 'User') {
    const name: string | undefined = entity.name
    console.log(name)
  }

  // The inline fragment always selects the __typename of a User.
  const user = abstractPlusInline.getRandomEntity
  if (user && 'name' in user) {
    const typename: 'User' = user.__typename
    console.log(typename)
  }
}
