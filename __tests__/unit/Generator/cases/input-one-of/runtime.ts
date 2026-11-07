import type * as T from './result'

// Exactly one field is set.
export const byId: T.EntityQueryVariables = { by: { id: '1' } }
export const byPath: T.EntityQueryVariables = { by: { path: '/home' } }
export const nested: T.EntitiesQueryVariables = {
  by: [{ filter: { by: { id: '1' } } }],
  filter: { by: { path: '/home' } },
}

// @ts-expect-error No field is set.
export const none: T.EntityBy = {}

// @ts-expect-error Two fields are set.
export const two: T.EntityBy = { id: '1', path: '/home' }

// @ts-expect-error The field can't be null.
export const nullValue: T.EntityBy = { id: null }

export default function (by: T.EntityBy): string | number | undefined {
  // The type can be narrowed by checking a field.
  if (by.path !== undefined) {
    const path: string = by.path
    return path
  }
  return by.id
}
