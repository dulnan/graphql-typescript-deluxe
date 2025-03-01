import {
  type FragmentWithEnumFragment,
  EntityType,
  type EntityType as EntityTypeType,
} from './result'

function assertSameType(type: EntityTypeType): void {
  console.log(type)
}

function worksAsString(type: string): void {
  console.log(typeof type === 'string')
}

export default function (entity: FragmentWithEnumFragment): void {
  if (entity.entityType === EntityType.NODE) {
    console.log(entity.entityType === 'NODE')
    // @ts-expect-error Can only be 'NODE'.
    console.log(entity.entityType === 'MEDIA')
  }

  assertSameType(entity.entityType)
  worksAsString(entity.entityType)
}
