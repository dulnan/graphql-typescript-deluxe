import type * as T from './result'

// Real responses must be assignable. Each is the response for a Page, whose
// branch must not be merged with the one for Article.
export const includeInOneBranch: T.IncludeInOneBranchQuery = {
  node: { __typename: 'Page' },
}
export const nestedUnion: T.NestedUnionQuery = {
  node: { __typename: 'Page', related: { __typename: 'Page', title: 'Home' } },
}
export const nestedTypename: T.NestedTypenameQuery = {
  node: { __typename: 'Page', author: { __typename: 'Company', name: 'ACME' } },
}
export const nestedAliasedTypename: T.NestedAliasedTypenameQuery = {
  node: { __typename: 'Page', author: { kind: 'Company' } },
}
export const nestedInclude: T.NestedIncludeQuery = {
  node: { __typename: 'Page', author: {} },
}
export const nestedConditionalSpread: T.NestedConditionalSpreadQuery = {
  node: { __typename: 'Page', author: {} },
}
export const nullableOrConditional: T.NullableOrConditionalQuery = {
  node: { __typename: 'Page', author: {} },
}

export default function (
  includeInOneBranch: T.IncludeInOneBranchQuery,
  nestedUnion: T.NestedUnionQuery,
  nestedInclude: T.NestedIncludeQuery,
  sameShape: T.SameShapeQuery,
): void {
  // The title is always selected on Article.
  const node = includeInOneBranch.node
  if (node?.__typename === 'Article') {
    const title: string = node.title
    console.log(title)
  }

  // Page selected the title of a related Page.
  const page = nestedUnion.node
  if (page?.__typename === 'Page' && page.related?.__typename === 'Page') {
    const title: string = page.related.title
    console.log(title)
  }

  // The id of the author of an Article is always selected.
  const article = nestedInclude.node
  if (article?.__typename === 'Article' && article.author) {
    const id: string | number = article.author.id
    console.log(id)
  }

  // Branches that generate the same type are merged.
  const merged = sameShape.node
  if (merged?.__typename === 'Page') {
    const title: string = merged.title
    console.log(title)
  }
}
