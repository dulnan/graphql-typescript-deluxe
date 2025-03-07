import {
  GraphQLObjectType,
  isAbstractType,
  type GraphQLAbstractType,
  type GraphQLNamedType,
  type GraphQLSchema,
  type OperationDefinitionNode,
} from 'graphql'
import { TypeNotFoundError } from '../errors'

export class SchemaProvider {
  /**
   * Pre-computed ABSTRACT_CONCRETE implemenations.
   */
  private schemaImplementation: Set<string> = new Set()

  /**
   * Pre-computed possible types for abstract types.
   */
  private schemaPossibleTypes: Map<string, string[]> = new Map()

  constructor(private schema: GraphQLSchema) {
    this.buildSchemaCache()
  }

  /**
   * Build the schema cache for quick look up.
   */
  private buildSchemaCache(): void {
    const typeMap = this.schema.getTypeMap()

    for (const type of Object.values(typeMap)) {
      if (isAbstractType(type)) {
        const possibleTypes = this.schema.getPossibleTypes(type)
        for (const objectType of possibleTypes) {
          this.schemaImplementation.add(
            `implements:${type.name}---${objectType.name}`,
          )
        }
        const names = possibleTypes.map((v) => v.name)
        this.schemaPossibleTypes.set(type.name, names)
      }
    }
  }

  /**
   * Update the schema.
   *
   * @param schema - The new schema.
   *
   * @returns SchemaProvider
   */
  public update(schema: GraphQLSchema): SchemaProvider {
    this.schema = schema
    this.schemaImplementation.clear()
    this.schemaPossibleTypes.clear()
    this.buildSchemaCache()
    return this
  }

  /**
   * Get the root type for an operation node.
   *
   * @param node - The operation defintion node.
   *
   * @returns The GraphQL type.
   */
  public getRootType(node: OperationDefinitionNode): GraphQLNamedType | null {
    switch (node.operation) {
      case 'query':
        return this.schema.getQueryType() || null
      case 'mutation':
        return this.schema.getMutationType() || null
      case 'subscription':
        return this.schema.getSubscriptionType() || null
    }
    return null
  }

  /**
   * Get a type by name.
   *
   * @param name - The name of the type.
   *
   * @returns The type.
   *
   * @throws {@link TypeNotFoundError} if the type does not exist.
   */
  public getType(name: string): GraphQLNamedType {
    const type = this.schema.getType(name)
    if (!type) {
      throw new TypeNotFoundError(name)
    }

    return type
  }

  /**
   * Get the names of possible object types for the abstract type.
   *
   * @param abstractName - The name of the abstract type.
   *
   * @returns All object types that implement / are part of the union.
   */
  public getPossibleObjectTypeNames(abstractName: string): string[] {
    return this.schemaPossibleTypes.get(abstractName) || []
  }

  /**
   * Get possible types for an abstract type.
   *
   * @param type - The abstract type.
   *
   * @returns An array of object types.
   */
  public getPossibleTypes(
    type: GraphQLAbstractType,
  ): readonly GraphQLObjectType[] {
    return this.schema.getPossibleTypes(type)
  }

  /**
   * Checks whether the given object type implements the given abstract type name.
   *
   * @param type - The name of the object type.
   * @param abstractName - The name of the abstract type.
   *
   * @returns True if the type implements the abstract type.
   */
  public objectImplements(objectName: string, abstractName: string): boolean {
    return this.schemaImplementation.has(
      `implements:${abstractName}---${objectName}`,
    )
  }
}
