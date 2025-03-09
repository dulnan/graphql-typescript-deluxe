import type { GeneratorInput } from '../src/types'
import { parse } from 'graphql'

export function toDocument(
  content: string,
  filePath = 'test.graphql',
): GeneratorInput {
  const documentNode = parse(content, {
    noLocation: false,
  })
  return {
    documentNode,
    filePath,
  }
}
