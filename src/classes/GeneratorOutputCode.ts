import type {
  GeneratedCode,
  GeneratedCodeByOutputType,
  GeneratedCodeIdentifier,
  GeneratedCodeType,
} from '../types'
import { DependencyAware } from './DependencyAware'

export class GeneratorOutputCode
  extends DependencyAware
  implements Omit<GeneratedCode, 'dependencies'>
{
  /**
   * The unique identifier.
   */
  public readonly id: string

  /**
   * The generated code type.
   */
  public readonly type: GeneratedCodeType

  /**
   * The name of the exported type or code.
   */
  public readonly name: string

  /**
   * The comment.
   */
  public readonly comment: string | undefined

  /**
   * The name of the GraphQL type, interface, enum, etc.
   */
  public readonly graphqlName: string | null | undefined

  /**
   * The GraphQL identifier.
   */
  public readonly identifier: GeneratedCodeIdentifier | undefined | null

  /**
   * The valid TypeScript code.
   *
   * Can contain one or more exports.
   */
  public readonly code: GeneratedCodeByOutputType

  /**
   * The filePath of the source input document.
   */
  public readonly filePath: string | undefined

  /**
   * The source code.
   *
   * Can be the raw string of a fragment definition, operation definition or the source of the enum in the schema.
   */
  public readonly source: string | undefined | null

  /**
   * The timestamp when it was generated.
   */
  public readonly timestamp: number | undefined

  constructor(code: GeneratedCode) {
    super(code.dependencies || [])
    this.id = code.id
    this.type = code.type
    this.name = code.name
    this.comment = code.comment
    this.graphqlName = code.graphqlName
    this.identifier = code.identifier
    this.code = code.code
    this.filePath = code.filePath
    this.source = code.source
    this.timestamp = code.timestamp
  }
}
