import type {
  GeneratedCodeType,
  GeneratorInputArg,
  GeneratorInput,
} from '../types'
import { parse } from 'graphql'

export function toInputDocuments(input: GeneratorInputArg): GeneratorInput[] {
  const inputArray = Array.isArray(input) ? input : [input]

  return inputArray.map((v) => {
    if (typeof v === 'string') {
      const documentNode = parse(v)
      return {
        documentNode,
        filePath: 'no-file-path',
      }
    }
    if ('documentNode' in v) {
      return v
    }
    return {
      documentNode: v,
      filePath: 'no-file-path',
    }
  })
}

export function getCodeTypeLabel(type: GeneratedCodeType): string {
  switch (type) {
    case 'concrete-typename':
      return 'Concrete Types'
    case 'typename-union':
      return 'Interfaces & Unions'
    case 'enum':
      return 'Enums'
    case 'input':
      return 'Input Types'
    case 'operation':
      return 'Operations'
    case 'fragment':
      return 'Fragments'
  }
}
