import type {
  GeneratedCode,
  GeneratedCodeIdentifier,
  GeneratedCodeType,
} from '../types'
import { DependencyAware } from './DependencyAware'

export class GeneratorOutputCode
  extends DependencyAware
  implements Omit<GeneratedCode, 'dependencies'>
{
  public readonly type: GeneratedCodeType
  public readonly name: string
  public readonly graphqlName: string | null | undefined
  public readonly identifier: GeneratedCodeIdentifier | undefined | null
  public readonly code: string
  public readonly filePath: string | undefined
  public readonly source: string | undefined | null
  public readonly timestamp: number | undefined

  constructor(code: GeneratedCode) {
    super(code.dependencies || [])
    this.type = code.type
    this.name = code.name
    this.graphqlName = code.graphqlName
    this.identifier = code.identifier
    this.code = code.code
    this.filePath = code.filePath
    this.source = code.source
    this.timestamp = code.timestamp
  }
}
