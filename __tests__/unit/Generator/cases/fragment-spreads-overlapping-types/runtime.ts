import type * as T from './result'

// Real responses must be assignable. No fragment applies to a NodeArticle.
export const overlap: T.OverlapQuery = {
  search: [
    {
      entityType: 'MEDIA',
      provider: 'YouTube',
      id: '1',
      videoUrl: 'https://example.com',
    },
    {},
  ],
}
export const coverAllWithOverlap: T.CoverAllWithOverlapQuery = {
  search: [{ id: '1', videoUrl: 'https://example.com' }, { id: '2' }],
}
export const severalInterfaces: T.SeveralInterfacesQuery = {
  getRandomEntity: {
    entityType: 'MEDIA',
    provider: 'YouTube',
    id: '1',
    videoUrl: 'https://example.com',
  },
}
export const conflict: T.ConflictQuery = {
  search: [{ author: { name: 'Jane', email: 'jane@example.com' } }, {}],
}

export default function (
  overlap: T.OverlapQuery,
  coverAll: T.CoverAllQuery,
  coverAllWithOverlap: T.CoverAllWithOverlapQuery,
  severalInterfaces: T.SeveralInterfacesQuery,
): void {
  // A MediaVideo has the fields of both fragments.
  const video = overlap.search?.[0]
  if (video && 'videoUrl' in video) {
    const provider: string | undefined = video.provider
    console.log(provider)
  }

  // The fragment applies to all types.
  const id: string | undefined = coverAll.search?.[0]?.id
  console.log(id)

  const result = coverAllWithOverlap.search?.[0]
  if (result) {
    const id: string = result.id
    console.log(id)
  }

  const entity = severalInterfaces.getRandomEntity
  if (entity && 'videoUrl' in entity) {
    const provider: string | undefined = entity.provider
    console.log(provider)
  }
}
