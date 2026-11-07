import type * as T from './result'

// Real responses must be assignable to the generated types.

// $a and $b are false.
export const bothConditional: T.BothConditionalQuery = { getHomepage: {} }

// Only $a is true.
export const nestedBothConditionalA: T.NestedBothConditionalQuery = {
  getMenu: {
    links: [{ link: { label: 'Home' }, subtree: [{ link: { url: '/' } }] }],
  },
}

// Only $b is true.
export const nestedBothConditionalB: T.NestedBothConditionalQuery = {
  getMenu: {
    links: [{ link: { url: '/' }, subtree: [{ link: { url: '/' } }] }],
  },
}

// $a is false.
export const nestedOneConditional: T.NestedOneConditionalQuery = {
  getMenu: { links: [{ link: { label: 'Home' } }] },
}

// $a and $b are false.
export const inlineFragment: T.InlineFragmentQuery = {
  getHomepage: { title: 'Home' },
}

// $a and $b are false.
export const abstractTypeNodePage: T.AbstractTypeQuery = {
  getNonNullEntity: { title: 'Home' },
}
export const abstractTypeUser: T.AbstractTypeQuery = {
  getNonNullEntity: { id: '1' },
}

// $a is false.
export const rootField: T.RootFieldQuery = {
  getNonNullEntity: { entityType: 'NODE' },
}

// Only $a is true.
export const rootFieldAbstractA: T.RootFieldAbstractQuery = {
  getNonNullEntity: { title: 'Home' },
}

// Only $b is true.
export const rootFieldAbstractB: T.RootFieldAbstractQuery = {
  getNonNullEntity: { id: '1' },
}

// Only $a is true.
export const rootFieldAbstractTypenameA: T.RootFieldAbstractTypenameQuery = {
  getNonNullEntity: { __typename: 'User' },
}

// Only $b is true.
export const rootFieldAbstractTypenameB: T.RootFieldAbstractTypenameQuery = {
  getNonNullEntity: { __typename: 'NodePage', id: '1' },
}

// Only $a is true.
export const rootFieldAbstractTypenameMixedA: T.RootFieldAbstractTypenameMixedQuery =
  { getNonNullEntity: { __typename: 'NodePage', title: 'Home' } }

// Only $b is true.
export const rootFieldAbstractTypenameMixedB: T.RootFieldAbstractTypenameMixedQuery =
  { getNonNullEntity: { __typename: 'User', id: '1' } }

// $a and $b are false.
export const fragment: T.PageFieldsFragment = { id: '1' }

export default function (
  oneConditional: T.OneConditionalQuery,
  nestedBothConditional: T.NestedBothConditionalQuery,
  nestedOneConditional: T.NestedOneConditionalQuery,
  inlineFragment: T.InlineFragmentQuery,
  rootField: T.RootFieldQuery,
  rootFieldSameCondition: T.RootFieldSameConditionQuery,
): void {
  // Fields with an unconditional selection are required.
  const title: string | undefined = oneConditional.getHomepage?.title
  const id: string | undefined = oneConditional.getHomepage?.id
  console.log(title, id)

  // Nested fields selected by both conditional selections are required.
  const link = nestedBothConditional.getMenu?.links?.[0]?.link
  const url: string | undefined =
    nestedBothConditional.getMenu?.links?.[0]?.subtree[0]?.link.url
  console.log(link, url)

  // The unconditional selection is required.
  const label: string | undefined =
    nestedOneConditional.getMenu?.links[0]?.link.label
  console.log(label)

  console.log(inlineFragment.getHomepage?.title.length)

  // The root field has an unconditional selection.
  console.log(rootField.getNonNullEntity.entityType)

  // Fields with the same condition are merged into one selection.
  if (rootFieldSameCondition.getNonNullEntity) {
    const sameConditionId: string = rootFieldSameCondition.getNonNullEntity.id
    console.log(sameConditionId)
  }
}
