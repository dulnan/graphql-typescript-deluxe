import { NO_FILE_PATH } from '../constants'
import type {
  GeneratedCodeType,
  GeneratorInputArg,
  GeneratorInput,
} from '../types'
import { parse } from 'graphql'

/**
 * Convert the input argument to a valid array of generator inputs.
 *
 * @param input - The possible generator input.
 *
 * @returns The array of generator inputs.
 */
export function toInputDocuments(input: GeneratorInputArg): GeneratorInput[] {
  const inputArray = Array.isArray(input) ? input : [input]

  return inputArray.map((v) => {
    if (typeof v === 'string') {
      const documentNode = parse(v)
      return {
        documentNode,
        filePath: NO_FILE_PATH,
      }
    } else if ('documentNode' in v) {
      if ('filePath' in v && v.filePath) {
        return v
      }

      return {
        documentNode: v.documentNode,
        filePath: NO_FILE_PATH,
      }
    } else if ('document' in v) {
      const documentNode = parse(v.document)
      return {
        documentNode,
        filePath: v.filePath || NO_FILE_PATH,
      }
    }
    return {
      documentNode: v,
      filePath: NO_FILE_PATH,
    }
  })
}

/**
 * Get the label for a generated code type.
 *
 * @param type - The generated code type.
 *
 * @returns The label.
 */
export function getCodeTypeLabel(type: GeneratedCodeType): string {
  switch (type) {
    case 'typename-object':
      return 'Object Types'
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
    case 'helpers':
      return 'Helpers'
  }
}
