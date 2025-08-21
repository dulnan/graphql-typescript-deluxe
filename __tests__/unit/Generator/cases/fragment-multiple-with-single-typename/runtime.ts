import type { NodeAccomodationFragment } from './result'

export default function (value: NodeAccomodationFragment): void {
  if (!value.address) {
    return
  }

  if (!value.address.address) {
    return
  }

  console.log(value.address.address.locality)
  console.log(value.address.fieldEmail)
  console.log(value.address.__typename === 'NodeAddress')

  // @ts-expect-error Wrong type.
  console.log(value.address.__typename === 'InvalidType')
}
