import type * as T from './result'

// Real responses must be assignable.
export const nextToFields: T.NextToFieldsQuery = {
  getHomepage: { title: 'Home' },
}
export const nextToFragment: T.NextToFragmentQuery = {
  getHomepage: { title: 'Home' },
}
export const nested: T.NestedQuery = { getHomepage: { title: 'Home' } }
export const conditional: T.ConditionalQuery = {
  getHomepage: { title: 'Home' },
}
export const onlyEmptyFragments: T.OnlyEmptyFragmentsQuery = {
  getHomepage: {},
}
export const selectsOnType: T.SelectsOnTypeQuery = {
  getHomepage: { title: 'Home', body: 'Text' },
}
export const abstractBranchUser: T.AbstractBranchQuery = {
  getRandomEntity: { id: '1', name: 'Jane' },
}
export const abstractBranchOther: T.AbstractBranchQuery = {
  getRandomEntity: { id: '2' },
}
export const shortcut: T.ShortcutQuery = {
  search: [{ id: '1', videoUrl: 'https://example.com' }, {}],
}
