import type * as T from './result'

// Real responses must be assignable, including the type specific fields.
export const unionFragment: T.UnionFragmentQuery = {
  getRandomEntity: {
    __typename: 'NodeArticle',
    tags: ['news'],
    author: { name: 'Jane', email: 'jane@example.com' },
  },
}
export const objectFragment: T.ObjectFragmentQuery = {
  getRandomEntity: { tags: ['news'], author: { name: 'Jane' } },
}
export const objectFragmentWithUnion: T.ObjectFragmentWithUnionQuery = {
  getRandomEntity: { tags: ['news'], author: { name: 'Jane' } },
}
export const conditionalUnionFragment: T.ConditionalUnionFragmentQuery = {
  getRandomEntity: { author: { name: 'Jane' } },
}

export default function (
  unionFragment: T.UnionFragmentQuery,
  objectFragmentWithUnion: T.ObjectFragmentWithUnionQuery,
): void {
  // The fields of the fragment's branch for the type are available.
  const article = unionFragment.getRandomEntity
  if (article && '__typename' in article) {
    const tags: (string | null)[] | undefined = article.tags
    const name: string = article.author.name
    console.log(tags, name)
  }

  // Without __typename, the branch is selected with "in".
  const entity = objectFragmentWithUnion.getRandomEntity
  if (entity && 'tags' in entity) {
    const tags: (string | null)[] | undefined = entity.tags
    const name: string = entity.author.name
    console.log(tags, name)
  }
}
