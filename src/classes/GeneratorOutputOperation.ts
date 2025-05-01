import type { OperationDefinitionNode, OperationTypeNode } from 'graphql'
import type { CollectedOperation } from '../types'
import { DependencyAware } from './DependencyAware'

export class GeneratorOutputOperation
  extends DependencyAware
  implements Omit<CollectedOperation, 'dependencies'>
{
  /**
   * The operation type.
   */
  public readonly operationType: OperationTypeNode

  /**
   * The operation definition node.
   */
  public readonly node: OperationDefinitionNode

  /**
   * The GraphQL name of the operation.
   */
  public readonly graphqlName: string

  /**
   * The generated TypeScript type name for the operation.
   */
  public readonly typeName: string

  /**
   * The generated TypeScript type name for the operation variables.
   */
  public readonly variablesTypeName: string

  /**
   * True if the operation has variables.
   */
  public readonly hasVariables: boolean

  /**
   * True if the operation has variables and at least one of the variables is non-null.
   */
  public readonly needsVariables: boolean

  /**
   * The filePath of the source input document.
   */
  public readonly filePath: string

  /**
   * The timestamp when the operation was last collected.
   *
   * The timestamp will change whenever:
   * - The input document that provides the operation was updated
   * - One of the dependencies (such as fragments) was updated
   *
   * This can be used to perform proper validation of operations after every
   * build step and only do validation for operations that have changed.
   */
  public readonly timestamp: number

  constructor(operation: CollectedOperation) {
    super(operation.dependencies)
    this.operationType = operation.operationType
    this.node = operation.node
    this.graphqlName = operation.graphqlName
    this.typeName = operation.typeName
    this.variablesTypeName = operation.variablesTypeName
    this.hasVariables = operation.hasVariables
    this.needsVariables = operation.needsVariables
    this.filePath = operation.filePath
    this.timestamp = operation.timestamp
  }
}
