import type { DefinitionNode, DocumentNode, GraphQLNamedType } from 'graphql'

export type GeneratorInput = {
  documentNode: DocumentNode
  filePath: string
}

export type GeneratorInputArg =
  | GeneratorInput[]
  | GeneratorInput
  | DocumentNode
  | DocumentNode[]
  | string

export type TypeContext = {
  input?: GeneratorInput
  filePath?: string
  definition?: DefinitionNode | null
  type?: GraphQLNamedType
}

export type GeneratedCodeType =
  | 'enum'
  | 'input'
  | 'fragment'
  | 'operation'
  | 'concrete-typename'
  | 'typename-union'

export interface GeneratedCode {
  type: GeneratedCodeType
  name: string
  code: string
  filePath: string
  dependencies: string[]
}
