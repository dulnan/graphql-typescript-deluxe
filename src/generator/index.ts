import {
  Kind,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isUnionType,
  type DefinitionNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLAbstractType,
  type GraphQLEnumType,
  type GraphQLField,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type GraphQLType,
  type GraphQLUnionType,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type TypeNode,
} from 'graphql'
import {
  getTypeNodeKey,
  hasConditionalDirective,
  inlineRootQueryFragmentsAndMerge,
  selectionSetToKey,
  unwrapNonNull,
} from '../helpers/ast'
import type { GeneratorOptions } from '../types/options'
import { buildOptions } from '../helpers/options'
import { makeComment, makeExport, makeTypeDoc } from '../helpers/string'
import type {
  GeneratedCode,
  GeneratedCodeType,
  GeneratorInputArg,
  GeneratorInput,
  TypeContext,
} from '../types'
import { toInputDocuments } from '../helpers/generator'
import {
  DuplicateInputDocumentError,
  FieldNotFoundError,
  FragmentNotFoundError,
  LogicError,
  MissingRootTypeError,
  TypeNotFoundError,
} from '../errors'
import {
  IR,
  hasTypenameField,
  isIdenticalIR,
  markNonNull,
  mergeFragmentSpread,
  mergeIR,
  mergeObjectIR,
  postProcessIR,
  type IRNode,
  type IRNodeFragmentSpread,
  type IRNodeObject,
} from '../helpers/ir'
import { getRootType } from '../helpers/schema'
import { GeneratorOutput } from '../classes/GeneratorOutput'
import { DependencyTracker } from '../classes/DependencyTracker'
import type { DeepRequired } from '../helpers/type'
import { NO_FILE_PATH, TYPENAME } from '../constants'

export class Generator {
  /**
   * The mapped options.
   */
  private options: DeepRequired<GeneratorOptions>

  /**
   * The schema for which we generate types.
   */
  private schema: GraphQLSchema

  /**
   * The input documents.
   */
  private inputDocuments: Map<string, GeneratorInput> = new Map()

  /**
   * All fragment definitions.
   */
  private fragments: Map<
    string,
    { node: FragmentDefinitionNode; filePath: string; dependencies: string[] }
  > = new Map()

  /**
   * The generated code.
   */
  private generatedCode: Map<string, GeneratedCode> = new Map()

  /**
   * Key-value cache.
   */
  private cache: Map<
    string,
    { result: any; filePath: string; dependencies: string[] }
  > = new Map()

  /**
   * The IRs of all fragments.
   */
  private fragmentIRs: Map<
    string,
    { ir: IRNode; filePath: string; dependencies: string[] }
  > = new Map()

  /**
   * Debug counts.
   */
  private debugCounts: Record<string, number> = {}

  /**
   * Dependency tracker.
   */
  private dependencyTracker: DependencyTracker | null = null

  /**
   * Constructs a new Generator instance.
   *
   * @param schema - The GraphQL schema.
   * @param options - The options.
   */
  constructor(schema: GraphQLSchema, options?: GeneratorOptions) {
    this.schema = schema
    this.options = buildOptions(options) as DeepRequired<GeneratorOptions>
    if (this.options.dependencyTracking) {
      this.dependencyTracker = new DependencyTracker()
    }
  }

  /**
   * Generate the types for the given documents.
   *
   * @param schema - The schema object.
   * @param documentOrRaw - The document node or the document file.
   * @param options - The generator options.
   */
  static generateOnce(
    schema: GraphQLSchema,
    input: GeneratorInputArg,
    options?: GeneratorOptions,
  ): string {
    const docs = toInputDocuments(input)
    const generator = new Generator(schema, options)
    generator.add(docs)
    return generator.build().getAll()
  }

  // ===========================================================================
  // Debugging
  // ===========================================================================

  /**
   * Logs the given arguments to the console when debug mode is enabled.
   */
  private logDebug(...args: any[]): void {
    if (!this.options.debugMode) {
      return
    }

    console.log(...args)
  }

  /**
   * When debug mode is enabled, increments the count for the given key.
   */
  private incrementDebugCount(key: string): void {
    if (!this.options.debugMode) {
      return
    }

    if (this.debugCounts[key] === undefined) {
      this.debugCounts[key] = -1
    }
    this.debugCounts[key]++
  }

  // ===========================================================================
  // Caching
  // ===========================================================================

  /**
   * Builds a cache key from prefix + key and stores the result from the callback
   * in cache.
   *
   * When called with the same prefix and key it returns the cached result.
   *
   * @param prefix - The prefix.
   * @param key - The cache key.
   * @param fn - The callback.
   *
   * @returns The return value from the callback.
   */
  private withCache<T>(prefix: string, key: string, fn: () => T): T {
    if (!this.options.useCache) {
      return fn()
    }
    const cacheKey = `${prefix}_${key}`
    const fromCache = this.cache.get(cacheKey)
    if (fromCache) {
      this.incrementDebugCount('Cache Hits')
      this.dependencyTracker?.merge(fromCache)
      return fromCache.result
    }
    this.dependencyTracker?.start()
    const result = fn()
    const dependencies = this.dependencyTracker?.end() || []
    this.cache.set(cacheKey, {
      result,
      filePath: this.dependencyTracker?.getCurrentFile() || '',
      dependencies,
    })
    return result
  }

  /**
   * Generates the code only once.
   *
   * @param generatedTypeType - The code type.
   * @param key - The unique key.
   * @param cb - The callback.
   *
   * @returns The name of the generated TS type.
   */
  private generateCodeOnce(
    generatedTypeType: GeneratedCodeType,
    key: string,
    cb: () => { code: string; typeName: string; context?: TypeContext },
  ): string {
    const existing = this.generatedCode.get(key)
    if (existing) {
      this.dependencyTracker?.merge(existing)
      return existing.name
    }
    this.dependencyTracker?.start()
    const result = cb()
    this.dependencyTracker?.add(generatedTypeType, result.typeName)
    const dependencies = this.dependencyTracker?.end() || []
    let comment = ''
    if (result.context && this.options.output.typeComment) {
      comment = makeTypeDoc(result.context) + '\n'
    }
    this.generatedCode.set(key, {
      type: generatedTypeType,
      name: result.typeName,
      code: `${comment}${result.code}`,
      filePath: this.dependencyTracker?.getCurrentFile() || '',
      dependencies,
    })
    return result.typeName
  }

  /**
   * Purges all items of the given map that originate from the given file
   * or that have the file as a dependency.
   *
   * @param map - The map to check.
   * @param filePath - The filePath to purge.
   */
  private purgeFromMap(
    map: Map<string, { filePath: string; dependencies: string[] }>,
    filePath: string,
  ): void {
    const fileDependencyKey = DependencyTracker.toKey('file', filePath)

    const entries = map.entries()
    for (const entry of entries) {
      const key = entry[0]
      const item = entry[1]
      if (item.filePath === filePath) {
        map.delete(key)
      } else if (item.dependencies.includes(fileDependencyKey)) {
        map.delete(key)
      }
    }
  }

  /**
   * Removes everything originating from the given file path.
   *
   * @param filePath - The file path.
   */
  private purgeFilePath(filePath: string): Generator {
    this.inputDocuments.delete(filePath)
    this.purgeFromMap(this.fragments, filePath)
    this.purgeFromMap(this.generatedCode, filePath)
    this.purgeFromMap(this.cache, filePath)
    this.purgeFromMap(this.fragmentIRs, filePath)
    return this
  }

  // ===========================================================================
  // Input Documents / Schema
  // ===========================================================================

  /**
   * Find the fragment node for the given name.
   *
   * @param name - The name of the fragment.
   *
   * @returns The fragment definition node.
   */
  private getFragmentNode(name: string): FragmentDefinitionNode {
    const item = this.fragments.get(name)
    if (!item) {
      throw new FragmentNotFoundError(name)
    }

    this.dependencyTracker?.merge(item)

    return item.node
  }

  /**
   * Checks whether the given object type implements the given abstract type name.
   *
   * @param type - The object type.
   * @param abstractName - The name of the abstract type.
   *
   * @returns True if the type implements the abstract type.
   */
  private objectImplements(
    type: GraphQLObjectType,
    abstractName: string,
  ): boolean {
    return this.withCache('objectImplements', type.name + abstractName, () => {
      return type.getInterfaces().some((i) => i.name === abstractName)
    })
  }

  /**
   * Execute the given callback for every available kind.
   *
   * @param kind - The kind.
   * @param cb - The callback
   */
  private forEachDefinitionKind<T extends Kind>(
    kind: T,
    cb: (def: DefinitionNode & { kind: T }, input: GeneratorInput) => void,
  ): void {
    for (const input of this.inputDocuments.values()) {
      this.dependencyTracker?.start(input.filePath)
      for (const def of input.documentNode.definitions) {
        if (def.kind !== kind) {
          continue
        }
        cb(def as DefinitionNode & { kind: T }, input)
      }
      this.dependencyTracker?.end()
    }
  }

  // ===========================================================================
  // Enums
  // ===========================================================================

  /**
   * Generates the code for the given enum type.
   *
   * @param type - The enum type.
   *
   * @returns The TS name of the generated enum type.
   */
  private getOrCreateEnum(type: GraphQLEnumType): string {
    return this.generateCodeOnce('enum', type.name, () => {
      const typeName = this.options.buildEnumTypeName(type)
      return {
        typeName,
        code: this.options.buildEnumCode(typeName, type),
        context: {
          definition: type.astNode,
          type,
        },
      }
    })
  }

  // ===========================================================================
  // Variables and Input Types
  // ===========================================================================

  /**
   * Generate the TS code for the given input type node.
   *
   * @param typeNode - The input type node.
   *
   * @returns The TS code.
   */
  private createInputTS(typeNode: TypeNode): string {
    return this.withCache('createInputTS', getTypeNodeKey(typeNode), () => {
      const { type, isNonNull } = unwrapNonNull(typeNode)
      const maybeNull = isNonNull ? '' : ' | null'
      if (type.kind === Kind.LIST_TYPE) {
        const element = this.createInputTS(type.type)
        return `Array<${element}>${maybeNull}`
      } else if (type.kind === Kind.NAMED_TYPE) {
        const namedType = this.schema.getType(type.name.value)
        if (!namedType) {
          throw new TypeNotFoundError(type.name.value)
        }
        const node = this.buildOutputTypeIR(namedType)
        node.nullable = !isNonNull
        return this.IRToCode(node)
      }
      return `any${maybeNull}`
    })
  }

  /**
   * Generate the code for the given input type.
   *
   * @param type - The input type.
   *
   * @returns The TS name of the type.
   */
  private getOrCreateInputType(type: GraphQLInputObjectType): string {
    return this.generateCodeOnce('input', type.name, () => {
      const typeName = this.options.buildInputTypeName(type)
      const fields = Object.entries(type.getFields()).reduce<
        Record<string, IRNode>
      >((acc, [name, field]) => {
        const required = isNonNullType(field.type)
        if (!field.astNode) {
          throw new LogicError('Missing astNode on input field: ' + field.name)
        }
        const tsType = this.createInputTS(field.astNode.type)
        acc[name] = IR.SCALAR({
          tsType,
          nullable: !required,
          description: field.description,
        })
        return acc
      }, {})

      const obj = IR.OBJECT({
        fields,
        nullable: false,
        graphQLTypeName: '',
        description: type.description,
      })

      return {
        code: makeExport(typeName, this.objectNodeToCode(obj)),
        typeName,
        context: { definition: type.astNode, type },
      }
    })
  }

  // ===========================================================================
  // Fragments
  // ===========================================================================

  /**
   * Generate the TS type for a fragment.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns The name of the TS type.
   */
  private generateFragmentType(fragmentName: string): string {
    const item = this.fragments.get(fragmentName)
    if (!item) {
      throw new FragmentNotFoundError(fragmentName)
    }

    return this.generateCodeOnce('fragment', fragmentName, () => {
      const item = this.fragments.get(fragmentName)

      if (!item) {
        throw new FragmentNotFoundError(fragmentName)
      }
      const typeName = this.options.buildFragmentTypeName(item.node)

      const graphqlTypeName = item.node.typeCondition.name.value
      const type = this.schema.getType(graphqlTypeName)
      if (!type) {
        throw new TypeNotFoundError(typeName)
      }

      this.dependencyTracker?.start()
      const ir = postProcessIR(
        this.buildSelectionSet(type, item.node.selectionSet),
      )
      const dependencies = this.dependencyTracker?.end() || []
      this.fragmentIRs.set(item.node.name.value, {
        ir,
        dependencies,
        filePath: this.dependencyTracker?.getCurrentFile() || NO_FILE_PATH,
      })
      const code = makeExport(
        typeName,
        this.IRToCode(ir, { skipTopLevelNull: true }),
      )

      return {
        code,
        typeName,
        context: {
          filePath: item.filePath,
          definition: item.node,
        },
      }
    })
  }

  // ===========================================================================
  // Operations
  // ===========================================================================

  /**
   * Generates the types for an operation.
   *
   * @param operation - The operation node.
   * @param input - The input document.
   */
  private generateOperationType(
    operation: OperationDefinitionNode,
    input: GeneratorInput,
  ): void {
    const opName = operation.name?.value
    if (!opName) {
      this.logDebug('Skipping unnamed operation.')
      return
    }

    const rootType = getRootType(this.schema, operation)
    if (!rootType) {
      throw new MissingRootTypeError(operation.name.value)
    }

    this.generateCodeOnce('operation', opName + '-base', () => {
      const selectionSet = inlineRootQueryFragmentsAndMerge(
        operation,
        this.fragments,
        rootType.name,
      )
      const typeName = this.options.buildOperationTypeName(
        opName,
        rootType,
        operation,
      )

      return {
        code: makeExport(
          typeName,
          this.IRToCode(
            postProcessIR(this.buildSelectionSet(rootType, selectionSet)),
            { skipTopLevelNull: true },
          ),
        ),
        context: { input, definition: operation },
        typeName,
      }
    })

    this.generateCodeOnce('operation', opName + '-variables', () => {
      const typeName = this.options.buildOperationVariablesTypeName(
        opName,
        rootType,
        operation,
      )
      const code = makeExport(typeName, this.generateVariablesType(operation))
      return { code, typeName, context: { input } }
    })
  }

  /**
   * Generate the variable type for an operation.
   *
   * @param operation - The operation.
   *
   * @returns The TS code.
   */
  private generateVariablesType(operation: OperationDefinitionNode): string {
    const definitions = operation.variableDefinitions
    if (!definitions?.length) {
      return this.options.output.emptyObject
    }

    return this.objectNodeToCode(
      IR.OBJECT({
        graphQLTypeName: '',
        fields: definitions.reduce<Record<string, IRNode>>((acc, vd) => {
          acc[vd.variable.name.value] = IR.SCALAR({
            tsType: this.createInputTS(vd.type),
            nullable: vd.type.kind !== Kind.NON_NULL_TYPE,
          })
          return acc
        }, {}),
        nullable: false,
      }),
    )
  }

  // ===========================================================================
  // Object Type and Abstract Type Unions
  // ===========================================================================

  /**
   * Creates the string literal type for a object type.
   *
   * @param arg - The name of a type or the type itself.
   *
   * @returns The name of the generated TS type.
   */
  private getOrCreateObjectTypeName(arg: string | GraphQLObjectType): string {
    const name = typeof arg === 'string' ? arg : arg.name
    return this.generateCodeOnce('typename-object', name, () => {
      const type = typeof arg === 'string' ? this.schema.getType(name) : arg

      if (!type) {
        throw new TypeNotFoundError(name)
      }

      if (!isObjectType(type)) {
        throw new LogicError(
          'Attempted to create object type string literal for non-object type: ' +
            name,
        )
      }

      return {
        code: `type ${name} = '${name}';`,
        typeName: name,
        context: { type },
      }
    })
  }

  /**
   * Generates the string literal union type for an abstract type.
   *
   * @param type - The abstract type.
   *
   * @returns The name of the generated TS type.
   */
  private getInterfaceTypenameType(
    type: GraphQLInterfaceType | GraphQLUnionType,
  ): string {
    return this.generateCodeOnce('typename-union', type.name, () => {
      const implementingTypes = this.schema.getPossibleTypes(type)
      const union =
        implementingTypes
          .map((v) => {
            return this.getOrCreateObjectTypeName(v)
          })
          .join(' | ') || 'never'

      return {
        code: makeExport(type.name, union),
        typeName: type.name,
        context: {
          type,
        },
      }
    })
  }

  // ===========================================================================
  // AST/IR
  // ===========================================================================

  /**
   * Builds the IR for the selection set.
   *
   * @param type - The GraphQL type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR node for the selection.
   */
  private buildSelectionSet(
    type: GraphQLNamedType,
    selectionSet: SelectionSetNode,
  ): IRNode {
    return this.withCache(
      'buildSelectionSet',
      type.name + selectionSetToKey(selectionSet),
      () => {
        if (isObjectType(type)) {
          return this.buildObjectSelectionSet(type, selectionSet)
        } else if (isInterfaceType(type) || isUnionType(type)) {
          return this.buildAbstractSelectionSet(
            type as GraphQLAbstractType,
            selectionSet,
          )
        }

        // We should never actually end up here, as there is no selection set for enums, etc.
        // However, just in case, let's return a scalar.
        return IR.SCALAR({
          tsType: 'any',
          nullable: false,
        })
      },
    )
  }

  /**
   * Returns the field map for the given fragment name.
   *
   * If the fragment does not yet exist, it will be created. This can happen
   * easily when we try to generate a fragment that spreads another fragment.
   *
   * The method will throw an error when there are circular dependencies, e.g.
   * when fragment A spreads fragment B which spreads fragment A.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns The map, where the key is the name of the field and the value is the IR node.
   */
  private getFragmentIRFields(fragmentName: string): Record<string, IRNode> {
    return this.withCache('getFragmentIRFields', fragmentName, () => {
      let ir = this.fragmentIRs.get(fragmentName)?.ir

      // This means the fragment has not yet been created.
      if (!ir) {
        // Generate the actual fragment IR.
        // If successful, this will store the IR of the fragment.
        this.generateFragmentType(fragmentName)
        ir = this.fragmentIRs.get(fragmentName)?.ir
      }

      if (!ir) {
        // Likely means there are circular references between two or more
        // fragments and we are trying to generated the IR recursively.
        // As this is anyway not allowed in the spec, throw an error.
        throw new LogicError(
          'Failed to generate IR for fragment: ' + fragmentName,
        )
      }

      // If it's an OBJECT node, just return its fields.
      if (ir.kind === 'OBJECT') {
        return ir.fields
      }

      // If it's a UNION, unify all OBJECT branches.
      if (ir.kind === 'UNION') {
        // Let's do a naive approach: unify all object branches
        // e.g. for each object branch => mergeObjectIR(...) into a single fields map
        let merged: Record<string, IRNode> = {}
        for (const branch of ir.types) {
          if (branch.kind === 'OBJECT') {
            merged = mergeObjectIR(merged, branch.fields)
          }
          // If it's something else like SCALAR or FRAGMENT_SPREAD, skip or handle as needed
        }
        return merged
      }

      // If it's an ARRAY, SCALAR, or FRAGMENT_SPREAD => there's no real "fields"
      return {}
    })
  }

  /**
   * Build the IR of the selection set of an object type.
   *
   * @param objectType - The object type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR for the selections.
   */
  private buildObjectSelectionSet(
    objectType: GraphQLObjectType,
    selectionSet: SelectionSetNode,
  ): IRNode {
    return this.withCache(
      'buildObjectSelectionSet',
      objectType.name + selectionSetToKey(selectionSet),
      () => {
        const objFields = objectType.getFields()
        const fields: Record<string, IRNode> = {}
        for (const sel of selectionSet.selections) {
          if (sel.kind === Kind.FIELD) {
            if (sel.name.value === TYPENAME) {
              // The user explicitly requests __typename for this object type
              // => we know exactly what that string is
              fields[TYPENAME] = IR.TYPENAME(
                this.getOrCreateObjectTypeName(objectType),
              )
              // We continue here so we skip calling buildFieldIR for __typename
              // (which might return the abstract union type)
              continue
            }

            const alias = sel.alias?.value || sel.name.value
            const fieldDef = objFields[sel.name.value]
            if (!fieldDef) {
              throw new FieldNotFoundError(sel.name.value, objectType.name)
            }
            const fieldIR = this.buildFieldIRFromFieldDef(fieldDef, sel)
            fields[alias] = mergeIR(fields[alias], fieldIR)
          } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
            const fragName = sel.name.value
            const fragDef = this.getFragmentNode(fragName)

            // If the fragment's typeCondition is the same or an interface the object implements, merge it
            const condName = fragDef.typeCondition.name.value
            if (
              condName === objectType.name ||
              this.objectImplements(objectType, condName)
            ) {
              const fragTypeName = this.options.buildFragmentTypeName(fragDef)
              mergeFragmentSpread(
                fields,
                IR.FRAGMENT_SPREAD({
                  name: fragName,
                  fragmentTypeName: fragTypeName,
                  parentType: objectType.name,
                  fragmentTypeCondition: condName,
                  nullable: false,
                }),
              )
            }
          }
        }

        // Always __typename field if option is set.
        if (this.options.output.nonOptionalTypename && !fields[TYPENAME]) {
          fields[TYPENAME] = IR.TYPENAME(
            this.getOrCreateObjectTypeName(objectType),
          )
        }

        return IR.OBJECT({
          graphQLTypeName: objectType.name,
          fields,
          nullable: true,
        })
      },
    )
  }

  /**
   * Generate the IR selection set for an abstract (interface, union) type.
   *
   * @param abstractType - The interface/union type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR node for the selection.
   */
  private buildAbstractSelectionSet(
    abstractType: GraphQLAbstractType,
    selectionSet: SelectionSetNode,
  ): IRNode {
    return this.withCache(
      'buildAbstractSelectionSet',
      abstractType.name + selectionSetToKey(selectionSet),
      () => {
        // Fields requested on interface/union level.
        const baseFields: Record<string, IRNode> = {}

        // Stores inline fragment fields for each object  subtype.
        // Key is name of object type, value is an object of fields => node.
        const subtypeMap = new Map<string, Record<string, IRNode>>()

        // Possible types that implement the interface/union.
        const possibleTypes = this.schema.getPossibleTypes(abstractType)

        // Gather all field selections on interface/union level.
        for (const sel of selectionSet.selections) {
          if (sel.kind !== Kind.FIELD) {
            continue
          }

          const fieldName = sel.name.value
          const aliasName = sel.alias?.value || fieldName
          if (fieldName === TYPENAME) {
            baseFields[aliasName] = IR.TYPENAME(
              this.getInterfaceTypenameType(abstractType),
            )
          }
          // If it's an interface, we can also gather interface-level fields directly
          else if (isInterfaceType(abstractType)) {
            const fieldDef = abstractType.getFields()[fieldName]
            if (!fieldDef) {
              throw new FieldNotFoundError(fieldName, abstractType.name)
            }
            const fieldIR = this.buildFieldIRFromFieldDef(fieldDef, sel)
            baseFields[aliasName] = mergeIR(baseFields[aliasName], fieldIR)
          }
        }

        // Always __typename field if option is set.
        if (this.options.output.nonOptionalTypename && !baseFields[TYPENAME]) {
          baseFields[TYPENAME] = IR.TYPENAME(
            this.getInterfaceTypenameType(abstractType),
          )
        }

        // Process inline fragments and fragment spreads.
        for (const sel of selectionSet.selections) {
          if (sel.kind === Kind.INLINE_FRAGMENT) {
            const condName = sel.typeCondition?.name.value
            if (!condName) {
              throw new LogicError('Inline fragment has no type condition.')
            }

            // then merge it into every object type T that implements condName
            const subType = this.schema.getType(condName)
            if (!subType) {
              throw new TypeNotFoundError(condName)
            }

            const ir = this.buildSelectionSet(subType, sel.selectionSet)

            // For each object type T that implements condName, merge IR
            for (const T of possibleTypes) {
              if (T.name === condName || this.objectImplements(T, condName)) {
                if (ir.kind === 'OBJECT') {
                  const merged = mergeObjectIR(
                    subtypeMap.get(T.name) || {},
                    ir.fields,
                  )
                  subtypeMap.set(T.name, merged)
                } else if (ir.kind === 'UNION') {
                  for (const branch of ir.types) {
                    if (
                      branch.kind === 'OBJECT' &&
                      branch.graphQLTypeName === T.name
                    ) {
                      const merged = mergeObjectIR(
                        subtypeMap.get(T.name) || {},
                        branch.fields,
                      )
                      subtypeMap.set(T.name, merged)
                    }
                  }
                } else if (ir.kind === 'FRAGMENT_SPREAD') {
                  const existing = subtypeMap.get(T.name) || {}
                  mergeFragmentSpread(existing, ir)
                  subtypeMap.set(T.name, existing)
                }
              }
            }
          } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
            const fragName = sel.name.value
            const fragDef = this.getFragmentNode(fragName)

            const condName = fragDef.typeCondition.name.value
            const subType = this.schema.getType(condName)
            if (!subType) {
              throw new TypeNotFoundError(condName)
            }

            if (isObjectType(subType)) {
              const fragTypeName = this.options.buildFragmentTypeName(fragDef)
              const existing = subtypeMap.get(subType.name) || {}
              mergeFragmentSpread(
                existing,
                IR.FRAGMENT_SPREAD({
                  name: fragDef.name.value,
                  fragmentTypeName: fragTypeName,
                  parentType: abstractType.name,
                  fragmentTypeCondition: fragDef.typeCondition.name.value,
                  nullable: false,
                }),
              )
              subtypeMap.set(subType.name, existing)
            } else if (isInterfaceType(subType) || isUnionType(subType)) {
              const ir = this.buildSelectionSet(subType, fragDef.selectionSet)
              if (ir.kind === 'UNION') {
                for (const branch of ir.types) {
                  if (branch.kind === 'OBJECT') {
                    const merged = mergeObjectIR(
                      subtypeMap.get(branch.graphQLTypeName) || {},
                      branch.fields,
                    )
                    subtypeMap.set(branch.graphQLTypeName, merged)
                  }
                }
              } else if (ir.kind === 'OBJECT') {
                const merged = mergeObjectIR(
                  subtypeMap.get(ir.graphQLTypeName) || {},
                  ir.fields,
                )
                subtypeMap.set(ir.graphQLTypeName, merged)
              }
            }
          }
        }

        const branches: IRNode[] = []
        const typesWithFragments = new Set(subtypeMap.keys())
        const typesWithoutFragments = possibleTypes
          .filter((v) => !typesWithFragments.has(v.name))
          .map((v) => v.name)
        const remainingCount = possibleTypes.length - typesWithFragments.size

        for (const pt of possibleTypes) {
          // Start with a copy of interface-level fields
          const mergedFields = { ...baseFields }

          // If user had an inline fragment for pt.name, merge those fields
          const subtypeFields = subtypeMap.get(pt.name)
          if (subtypeFields) {
            mergeObjectIR(mergedFields, subtypeFields)
          }

          if (hasTypenameField(baseFields)) {
            if (
              typesWithFragments.has(pt.name) ||
              !this.options.output.mergeTypenames
            ) {
              // This type has inline fragments, use object type
              mergedFields[TYPENAME] = IR.TYPENAME(
                this.getOrCreateObjectTypeName(pt),
              )
            } else if (typesWithFragments.size > 0) {
              // This is a fallback type (no inline fragments), and some types have fragments.
              // We can use Exclude<Interface, TypesWithFragments> to
              const excludedTypes = Array.from(typesWithFragments).map((name) =>
                this.getOrCreateObjectTypeName(name),
              )

              // Only use the Exclude<> for __typename when we have enough remaining types.
              // Else we would be creating an exclude argument that is longer than the actual
              // remaining types.
              if (remainingCount > 3) {
                mergedFields[TYPENAME] = IR.TYPENAME(
                  excludedTypes,
                  this.getInterfaceTypenameType(abstractType),
                )
              } else {
                mergedFields[TYPENAME] = IR.TYPENAME(typesWithoutFragments)
              }
            }
          }

          branches.push(
            IR.OBJECT({
              graphQLTypeName: pt.name,
              fields: mergedFields,
              nullable: true,
            }),
          )
        }

        // No branches: Produce an empty object.
        if (branches.length === 0) {
          return IR.OBJECT({
            graphQLTypeName: abstractType.name,
            fields: {},
            nullable: true,
          })
        } else if (branches.length === 1) {
          // Just one branch: We can return it directly.
          return branches[0]
        }

        return IR.UNION({
          types: branches,
          nullable: false,
        })
      },
    )
  }

  /**
   * Merges an object with fragment spreads and inline fields.
   *
   * If we detect a conflict between nested selections from inline spreads or
   * fragment spreads, we inline the entire field. We still use the fragment type if
   * possible, however, we exclude the conflicting fields from the fragment using Omit<>.
   *
   * @param fields - The field map.
   * @param spreads - The collected fragment spread IR nodes.
   *
   * @returns The output.
   */
  private mergeFragmentSpreads(
    fields: Map<string, IRNode>,
    spreads: IRNodeFragmentSpread[],
  ): string {
    // No fragment spreads.
    if (spreads.length === 0) {
      return ''
    }

    if (!fields.size) {
      return spreads.map((v) => v.fragmentTypeName).join(' & ')
    }

    // Map of all fields keyed by name of fragment.
    const fragmentFieldMaps: Record<string, Record<string, IRNode>> = {}

    for (const spread of spreads) {
      const fragmentFields = this.getFragmentIRFields(spread.name)
      fragmentFieldMaps[spread.fragmentTypeName] = fragmentFields
    }

    // We'll gather a union of all field names from all fragments and direct fields
    const allFieldNames = new Set<string>([
      ...fields.keys(),
      ...Object.values(fragmentFieldMaps).flatMap((fieldMap) =>
        Object.keys(fieldMap),
      ),
    ])

    const conflictFields: Map<string, IRNode> = new Map()

    // Now check for conflicts among fragments and direct fields
    for (const fieldName of allFieldNames) {
      const nodes: IRNode[] = []

      // Add direct field if it exists
      const directField = fields.get(fieldName)
      if (directField) {
        nodes.push(directField)
      }

      // Add fields from fragments
      for (const spread of spreads) {
        const node = fragmentFieldMaps[spread.fragmentTypeName][fieldName]
        if (node) {
          nodes.push(node)
        }
      }

      if (nodes.length <= 1) {
        // No conflict if only one source has it
        continue
      }

      // We unify them
      let merged = nodes[0]
      let conflictFound = false
      for (let i = 1; i < nodes.length; i++) {
        const next = nodes[i]
        // If mergeIR(...) yields a 'UNION' or if the shapes differ, we consider that a conflict
        const m = mergeIR(merged, next)
        // If m is a union or differs from merged => conflict
        if (m.kind === 'UNION' || !isIdenticalIR(m, merged)) {
          conflictFound = true
        }
        merged = m
      }

      if (conflictFound && !conflictFields.has(fieldName)) {
        conflictFields.set(fieldName, merged)
      }
    }

    // Create objects for our intersection
    const intersectionParts: string[] = []

    // Handle direct fields (excluding those that are in conflicts)
    const nonConflictingDirectFields = new Map(fields)
    for (const fieldName of conflictFields.keys()) {
      nonConflictingDirectFields.delete(fieldName)
    }

    // Add direct fields as an object if there are any non-conflicting fields
    if (nonConflictingDirectFields.size > 0) {
      intersectionParts.push(
        this.fieldMapToCode(nonConflictingDirectFields, true),
      )
    }

    // Add fragments with Omit for conflicting fields
    for (const spread of spreads) {
      const fragmentFields = fragmentFieldMaps[spread.fragmentTypeName]
      const allFragmentFieldNames = Object.keys(fragmentFields)

      // If there's a conflict field that the fragment actually defines, use Omit
      const conflictsForThisFrag = [...conflictFields.keys()].filter((fld) => {
        return fragmentFields[fld] !== undefined
      })

      // Skip fragment entirely if all of its fields are conflicting
      if (conflictsForThisFrag.length === allFragmentFieldNames.length) {
        continue
      }

      // Start with the fragment name
      let replacedType = spread.fragmentTypeName

      // Apply Omit for conflicting fields
      if (conflictsForThisFrag.length > 0) {
        const omitFields = conflictsForThisFrag.map((f) => `"${f}"`).join(' | ')
        replacedType = `Omit<${spread.fragmentTypeName}, ${omitFields}>`
      }

      intersectionParts.push(replacedType)
    }

    // Add merged conflict fields as a separate object into the intersection.
    if (conflictFields.size > 0) {
      intersectionParts.push(this.fieldMapToCode(conflictFields, true))
    }

    if (intersectionParts.length === 0) {
      // No intersections: Empty object.
      return this.options.output.emptyObject
    } else if (intersectionParts.length === 1) {
      // Just one intersection.
      return intersectionParts[0]
    }

    // Create a union.
    return `(${intersectionParts.join(' & ')})`
  }

  /**
   * Build the IR node for a field definition.
   *
   * @param field - The schema field.
   * @param fieldNode - The field node.
   *
   * @returns The IR node.
   */
  private buildFieldIRFromFieldDef(
    field: GraphQLField<any, any>,
    fieldNode: FieldNode,
  ): IRNode {
    const ir = this.withCache(
      'buildFieldIRFromFieldDef',
      field.name +
        field.type.toString() +
        selectionSetToKey(fieldNode.selectionSet),
      () => {
        this.incrementDebugCount('buildFieldIRFromFieldDef')
        return this.buildOutputTypeIR(field.type, fieldNode.selectionSet)
      },
    )

    // Always create a shallow clone, since the cache key we use excludes
    // directives and description.
    return {
      ...ir,
      // Either already nullable or nullable due to directive.
      nullable: ir.nullable || hasConditionalDirective(fieldNode),
      description: field.description,
    }
  }

  /**
   * Generate the IR output for the given type.
   *
   * @param type - The GraphQL type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR node.
   */
  private buildOutputTypeIR(
    type: GraphQLType,
    selectionSet?: SelectionSetNode,
  ): IRNode {
    this.incrementDebugCount('buildOutputTypeIR')

    if (isNonNullType(type)) {
      return markNonNull(this.buildOutputTypeIR(type.ofType, selectionSet))
    } else if (isListType(type)) {
      const innerType = type.ofType
      const innerIR = this.buildOutputTypeIR(innerType, selectionSet)
      return IR.ARRAY({
        ofType: innerIR,
        nullable: true,
        nullableElement: !isNonNullType(innerType),
      })
    } else if (isObjectType(type)) {
      if (!selectionSet) {
        return IR.OBJECT({
          graphQLTypeName: type.name,
          fields: {},
          nullable: true,
        })
      }
      return this.buildSelectionSet(type, selectionSet)
    } else if (isInterfaceType(type) || isUnionType(type)) {
      if (!selectionSet) {
        return IR.OBJECT({
          graphQLTypeName: type.name,
          fields: {},
          nullable: true,
        })
      }
      return this.buildSelectionSet(type, selectionSet)
    } else if (isEnumType(type)) {
      return IR.SCALAR({ tsType: this.getOrCreateEnum(type), nullable: true })
    } else if (isInputObjectType(type)) {
      return IR.SCALAR({
        tsType: this.getOrCreateInputType(type),
        nullable: false,
      })
    }

    return IR.SCALAR({
      tsType: this.options.buildScalarType(type) || 'any',
      nullable: true,
    })
  }

  /**
   * Generate the code for the given field map.
   *
   * @param map - The field map.
   *
   * @return The generated code.
   */
  private fieldMapToCode(
    map: Map<string, IRNode>,
    skipTopLevelNull: boolean,
  ): string {
    if (!map.size) {
      return this.options.output.emptyObject
    }

    const fieldNames = [...map.keys()].sort()

    let output = '{'

    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i]
      const ir = map.get(fieldName)!
      const tsType = this.IRToCode(ir, { skipTopLevelNull })
      const propertySuffix =
        ir.nullable && this.options.output.nullableField === 'optional'
          ? '?:'
          : ':'
      const valueSuffix =
        ir.nullable && this.options.output.nullableField === 'null'
          ? ' | null'
          : ''
      const field = `${fieldName}${propertySuffix} ${tsType}${valueSuffix};`

      output += '\n  '
      output += ir.description
        ? `${makeComment(ir.description)}\n  ${field}`
        : field
    }

    return output + '\n}'
  }

  /**
   * Convert an IR node to valid TypeScript code.
   *
   * @param ir - The IR node.
   * @param options - The options.
   * @param options.skipTopLevelNull - Skip generating `| null`.
   *
   * @return The TS code of the node.
   */
  private IRToCode(
    ir: IRNode,
    options: { skipTopLevelNull?: boolean } = {},
  ): string {
    this.incrementDebugCount('IRToCode')
    const skipTopLevelNull = options.skipTopLevelNull
    switch (ir.kind) {
      case 'SCALAR': {
        const base = ir.tsType
        if (!skipTopLevelNull && ir.nullable) {
          return `${base} | null`
        }
        return base
      }

      case 'TYPENAME': {
        const union = ir.types.join(' | ')
        if (ir.excludeType) {
          // Special case for Exclude<A, B>
          return `Exclude<${ir.excludeType}, ${union}>`
        }
        return union
      }

      case 'OBJECT': {
        const objStr = this.objectNodeToCode(ir)
        if (ir.nullable && !skipTopLevelNull) {
          return `${objStr} | null`
        }
        return objStr
      }

      case 'ARRAY': {
        const elemTS = this.IRToCode(ir.ofType, { skipTopLevelNull: true })
        const finalElem = ir.nullableElement ? `${elemTS} | null` : elemTS
        return this.options.output.arrayShape === 'Array'
          ? `Array<${finalElem}>`
          : `(${finalElem})[]`
      }

      case 'UNION': {
        const parts = ir.types.map((t) =>
          this.IRToCode(t, { skipTopLevelNull: true }),
        )
        const unionStr = `(${parts.join(' | ')})`
        if (!skipTopLevelNull && ir.nullable) {
          return unionStr + ' | null'
        }
        return unionStr
      }

      case 'FRAGMENT_SPREAD': {
        // Merges as an intersection into the parent's object.
        return ir.fragmentTypeName
      }
    }
  }

  /**
   * Convert an IR object node to code.
   *
   * @param node - The object node.
   *
   * @returns The generated code.
   */
  private objectNodeToCode(node: IRNodeObject): string {
    const fragmentSpreads: IRNodeFragmentSpread[] = []
    const otherFields: Map<string, IRNode> = new Map()

    for (const [fieldName, fieldIR] of Object.entries(node.fields)) {
      if (
        fieldName.startsWith('__fragment_') &&
        fieldIR.kind === 'FRAGMENT_SPREAD'
      ) {
        fragmentSpreads.push(fieldIR)
      } else {
        otherFields.set(fieldName, fieldIR)
      }
    }

    // When there are no fragment spreads, we can just build the object.
    if (!fragmentSpreads.length) {
      return this.fieldMapToCode(otherFields, true)
    }

    return this.mergeFragmentSpreads(otherFields, fragmentSpreads)
  }

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Update the schema.
   *
   * Note that this will also reset the state.
   *
   * @param schema - The schema object.
   *
   * @returns Generator
   */
  updateSchema(schema: GraphQLSchema): Generator {
    this.schema = schema
    return this.reset()
  }

  /**
   * Add one or more documents or generator inputs.
   *
   * @param arg - The GeneratorInput or DocumentNode or an array of those.
   *
   * @returns Generator
   */
  add(arg: GeneratorInputArg): Generator {
    const docs = toInputDocuments(arg)

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      if (this.inputDocuments.has(doc.filePath)) {
        throw new DuplicateInputDocumentError(doc.filePath)
      }
      this.inputDocuments.set(doc.filePath, doc)
    }

    return this
  }

  /**
   * Resets the entire state.
   *
   * - Remove all added input documents
   * - Remove all generated code
   * - Purge all caches.
   *
   * @returns Generator
   */
  reset(): Generator {
    this.inputDocuments.clear()
    this.fragments.clear()
    this.generatedCode.clear()
    this.cache.clear()
    this.fragmentIRs.clear()
    return this
  }

  /**
   * Update on or more documents.
   *
   * @param arg - The GeneratorInput or DocumentNode or an array of those.
   *
   * @returns Generator
   */
  update(arg: GeneratorInputArg): Generator {
    const docs = toInputDocuments(arg)

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      if (!this.inputDocuments.has(doc.filePath)) {
        throw new LogicError(
          'Attempted to update a document that does not exist: ' + doc.filePath,
        )
      }

      this.purgeFilePath(doc.filePath)
    }

    return this.add(docs)
  }

  /**
   * Removes all generated code originating from the given file path.
   *
   * @param filePath - The file path.
   *
   * @returns Generator
   */
  remove(filePath: string): Generator {
    this.purgeFilePath(filePath)
    return this
  }

  /**
   * Build the output from the current state.
   *
   * @returns GeneratorOutput
   */
  build(): GeneratorOutput {
    this.forEachDefinitionKind(Kind.FRAGMENT_DEFINITION, (node) => {
      if (!this.fragments.has(node.name.value)) {
        this.fragments.set(node.name.value, {
          node,
          filePath: this.dependencyTracker?.getCurrentFile() || '',
          dependencies: [],
        })
      }
    })

    this.forEachDefinitionKind(Kind.FRAGMENT_DEFINITION, (def) => {
      this.generateFragmentType(def.name.value)
    })

    this.forEachDefinitionKind(Kind.OPERATION_DEFINITION, (def, input) => {
      this.generateOperationType(def, input)
    })

    if (this.options.debugMode) {
      const entries = Object.entries(this.debugCounts)
      const longestKey =
        entries
          .map((v) => v[0])
          .sort((a, b) => b.length - a.length)
          .at(0)?.length || 20
      Object.entries(this.debugCounts).forEach(([key, count]) => {
        console.log(`${key.padEnd(longestKey + 1)}: ${count}`)
      })
    }

    // If we still have a remaining dependency tracker stack item at this point,
    // the code has a bug. Better throw an error here so it doesn't go unnoticed.
    if (this.dependencyTracker?.hasStack()) {
      throw new LogicError(
        'Finished processing documents, but there is still a dependency tracker stack.',
      )
    }
    const code = this.generatedCode.values()
    return new GeneratorOutput([...code])
  }
}
