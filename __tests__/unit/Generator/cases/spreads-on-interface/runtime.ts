import type { SpreadsOnInterfaceQuery } from './result.js'

export default function (query: SpreadsOnInterfaceQuery): void {
  const page = query.getPage

  if (!page) {
    return
  }

  const blocks = page.blocks

  if (!blocks) {
    return
  }

  const item = blocks.at(0)
  if (!item) {
    return
  }

  console.log(item.id)
  console.log(item.props)

  // @ts-expect-error Not available yet.
  console.log(item.props.text)

  if ('text' in item.props) {
    console.log(item.props.text)
    // @ts-expect-error Not available.
    console.log(item.props.imageUrl)
  }

  if ('imageUrl' in item.props) {
    console.log(item.props.imageUrl)
    // @ts-expect-error Not available.
    console.log(item.props.text)
  }
}
