import type { FragmentInterfaceQuery, NodeArticleFragment } from './result'

export default function (query: FragmentInterfaceQuery): void {
  const entity = query.getRandomEntity

  if (entity && 'categories' in entity) {
    console.log(mapNode(entity))
  }
}

function mapNode(node: NodeArticleFragment): Record<string, string> {
  return {
    title: node.tags?.join('') || '',
  }
}
