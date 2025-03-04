import type { DefinitionNode, DocumentNode, GraphQLNamedType } from 'graphql'

export type GeneratorInput = {
  /**
   * The document node.
   */
  documentNode: DocumentNode
  filePath: string
}

type GeneratorInputString = {
  document: string
  filePath?: string
}

/**
 * Possible types for adding or updating a document in the Generator.
 */
export type GeneratorInputArg =
  | GeneratorInput[]
  | GeneratorInput
  | Omit<GeneratorInput, 'filePath'>
  | Omit<GeneratorInput, 'filePath'>[]
  | GeneratorInputString
  | GeneratorInputString[]
  | DocumentNode
  | DocumentNode[]
  | string

export type TypeContext = {
  input?: GeneratorInput
  filePath?: string
  definition?: DefinitionNode | null
  type?: GraphQLNamedType
}

export type GeneratedCodeIdentifier =
  | 'fragment'
  | 'query'
  | 'mutation'
  | 'subscription'
  | 'enum'
  | 'input'
  | 'interface'
  | 'union'
  | 'type'

export type GeneratedCodeType =
  | 'enum'
  | 'input'
  | 'fragment'
  | 'operation'
  | 'operation-variables'
  | 'typename-object'
  | 'typename-union'
  | 'helpers'

export interface GeneratedCode {
  /**
   * The type.
   */
  type: GeneratedCodeType

  /**
   * The name of the generated type.
   */
  name: string

  /**
   * The name of the corresponding GraphQL element.
   */
  graphqlName: string | null

  /**
   * The GraphQL identifier.
   */
  identifier: GeneratedCodeIdentifier | null

  /**
   * The full code of the generated type, including export identifiers.
   */
  code: string

  /**
   * The path of the file that provided this type.
   */
  filePath: string

  /**
   * The dependencies.
   */
  dependencies: string[]

  /**
   * The GraphQL source.
   */
  source: string | null
}
