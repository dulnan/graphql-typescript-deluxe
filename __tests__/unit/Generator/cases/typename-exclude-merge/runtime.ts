import type * as T from './result'

// Real responses for every type must be assignable.
export const user: T.RedundantInlineFragmentQuery = {
  getRandomEntity: { __typename: 'User', id: '1' },
}
export const comment: T.RedundantInlineFragmentQuery = {
  getRandomEntity: { __typename: 'Comment', id: '1' },
}
export const otherUser: T.RedundantAndOtherInlineFragmentQuery = {
  getRandomEntity: { __typename: 'User', id: '1' },
}
export const otherComment: T.RedundantAndOtherInlineFragmentQuery = {
  getRandomEntity: { __typename: 'Comment', id: '1' },
}
export const otherDomain: T.RedundantAndOtherInlineFragmentQuery = {
  getRandomEntity: { __typename: 'Domain', id: '1', label: 'example.com' },
}

export default function (query: T.RedundantAndOtherInlineFragmentQuery): void {
  // The branch of Domain can still be narrowed.
  if (query.getRandomEntity?.__typename === 'Domain') {
    const label: string = query.getRandomEntity.label
    console.log(label)
  }
}
