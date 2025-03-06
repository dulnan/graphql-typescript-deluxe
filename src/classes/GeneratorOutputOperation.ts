import type { OperationTypeNode } from 'graphql'
import type { CollectedOperation } from '../types'
import { DependencyAware } from './DependencyAware'

export class GeneratorOutputOperation
  extends DependencyAware
  implements Omit<CollectedOperation, 'dependencies'>
{
  public readonly operationType: OperationTypeNode
  public readonly graphqlName: string
  public readonly typeName: string
  public readonly variablesTypeName: string
  public readonly hasVariables: boolean
  public readonly needsVariables: boolean
  public readonly filePath: string
  public readonly timestamp: number

  constructor(operation: CollectedOperation) {
    super(operation.dependencies)
    this.operationType = operation.operationType
    this.graphqlName = operation.graphqlName
    this.typeName = operation.typeName
    this.variablesTypeName = operation.variablesTypeName
    this.hasVariables = operation.hasVariables
    this.needsVariables = operation.needsVariables
    this.filePath = operation.filePath
    this.timestamp = operation.timestamp
  }
}
