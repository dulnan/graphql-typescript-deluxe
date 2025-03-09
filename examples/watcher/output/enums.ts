// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------


export const EntityType = {
  /** A node. */
  NODE: 'NODE',
  /** A media. */
  MEDIA: 'MEDIA'
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];