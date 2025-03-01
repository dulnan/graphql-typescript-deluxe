import type { FieldMergingDeepQuery } from './result.js'

export default function (v: FieldMergingDeepQuery) {
  const menu = v.getMenu
  if (!menu) {
    return
  }

  console.log(menu.name)
  console.log(menu.links)

  if (!menu.links) {
    return
  }

  const links = menu.links
  const firstLink = links[0]
  if (!firstLink) {
    return
  }

  console.log(firstLink.link.url)
  console.log(firstLink.link.label)

  const nested = firstLink.subtree
    ?.at(0)
    ?.subtree.at(0)
    ?.subtree.at(0)
    ?.subtree.at(0)?.link.label
  console.log(nested)
}
