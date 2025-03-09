import {
  Kind,
  isAbstractType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
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
  type InlineFragmentNode,
  type OperationDefinitionNode,
  type SelectionNode,
  type SelectionSetNode,
  type TypeNode,
} from 'graphql'
import {
  getAstSource,
  getTypeNodeKey,
  hasConditionalDirective,
  mergeSameFieldSelections,
  unwrapNonNull,
} from '../helpers/ast'
import type { GeneratorOptions, TypeCommentOptions } from '../types/options'
import { buildOptions, mapTypeCommentOptions } from '../helpers/options'
import { makeComment, makeExport, makeTypeDoc } from '../helpers/string'
import type {
  GeneratedCode,
  GeneratedCodeType,
  GeneratorInput,
  TypeContext,
  GeneratedCodeIdentifier,
  CollectedOperation,
  GeneratorInputArgs,
} from '../types'
import { toInputDocuments } from '../helpers/generator'
import {
  DependencyTrackingError,
  DuplicateInputDocumentError,
  FieldNotFoundError,
  FragmentNotFoundError,
  LogicError,
  MissingRootTypeError,
  type ErrorContext,
} from '../errors'
import {
  IR,
  buildFragmentIRFields,
  hasTypenameField,
  isIdenticalIR,
  mergeFragmentSpread,
  mergeIR,
  mergeObjectFields,
  postProcessIR,
  type IRNode,
  type IRNodeFragmentSpread,
  type IRNodeObject,
  type IRNodeScalar,
  type IRNodeTypename,
} from '../helpers/ir'
import { GeneratorOutput } from '../classes/GeneratorOutput'
import { DependencyTracker } from '../classes/DependencyTracker'
import type { DeepRequired } from '../helpers/type'
import { NO_FILE_PATH, TYPENAME } from '../constants'
import { formatCode } from '../helpers/format'
import { SchemaProvider } from './SchemaProvider'

export class Generator {
  /**
   * The SchemaProvider instance.
   */
  private readonly schema: SchemaProvider

  /**
   * The mapped options.
   */
  public readonly options: DeepRequired<GeneratorOptions>

  private readonly typeCommentOptions: Record<TypeCommentOptions, boolean>

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
   * All operation definitions.
   */
  private operations: Map<string, CollectedOperation> = new Map()

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
    { map: Record<string, IRNode>; filePath: string; dependencies: string[] }
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
   *
   * @throws {@link InvalidOptionError} if the provided options are not valid.
   */
  constructor(schema: GraphQLSchema, options?: GeneratorOptions) {
    this.options = buildOptions(options) as DeepRequired<GeneratorOptions>
    if (this.options.dependencyTracking) {
      this.dependencyTracker = new DependencyTracker()
    }

    this.typeCommentOptions = mapTypeCommentOptions(
      options?.output?.typeComment,
    )
    this.schema = new SchemaProvider(schema)
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
    input: GeneratorInputArgs,
    options?: GeneratorOptions,
  ): string {
    const docs = toInputDocuments(input)
    const generator = new Generator(schema, options)
    generator.add(docs)
    return generator.build().getEverything().getSource()
  }

  /**
   * Build the error context.
   *
   * @returns The error context.
   */
  private getErrorContext(): ErrorContext {
    const filePath = this.dependencyTracker?.getCurrentFile()
    if (!filePath) {
      return {}
    }
    return {
      filePath,
    }
  }

  // ===========================================================================
  // Debugging
  // ===========================================================================

  /**
   * Logs the given arguments to the console when debug mode is enabled.
   */
  private logDebug(...args: any[]): void {
    if (this.options.debugMode) {
      console.log(...args)
    }
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
   * @param keyArg - The cache key callback.
   * @param fn - The callback.
   *
   * @returns The return value from the callback.
   */
  private withCache<T>(
    prefix: string,
    keyArg: (() => string) | string,
    fn: () => T,
  ): T {
    if (!this.options.useCache) {
      this.incrementDebugCount('Cache HIT: ' + prefix)
      return fn()
    }
    const key = typeof keyArg === 'string' ? keyArg : keyArg()
    const cacheKey = `${prefix}_${key}`
    const fromCache = this.cache.get(cacheKey)
    if (fromCache) {
      this.incrementDebugCount('Cache Hits Total')
      this.incrementDebugCount('Cache HIT: ' + prefix)
      this.dependencyTracker?.merge(fromCache)
      return fromCache.result
    }
    this.incrementDebugCount('Cache MISS: ' + prefix)
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
    cb: () => {
      code: string
      typeName: string
      graphqlName?: string | null
      context?: TypeContext
      identifier?: GeneratedCodeIdentifier | null
      source?: string | null
    },
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
      comment =
        makeTypeDoc(
          {
            ...result.context,
            filePath: result.context.filePath
              ? this.options.output.buildTypeDocFilePath(
                  result.context.filePath,
                )
              : undefined,
          },
          this.typeCommentOptions,
        ) + '\n'
    }
    const code = this.formatCode(result.code)
    this.generatedCode.set(key, {
      id: DependencyTracker.toKey(generatedTypeType, result.typeName),
      type: generatedTypeType,
      name: result.typeName,
      code: `${comment}${code}`,
      filePath: this.dependencyTracker?.getCurrentFile() || '',
      dependencies,
      source: result.source,
      graphqlName: result.graphqlName,
      identifier: result.identifier,
      timestamp: Date.now(),
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
    map: Map<string, { filePath?: string; dependencies?: string[] }>,
    filePath?: string,
  ): void {
    const fileDependencyKey = filePath
      ? DependencyTracker.toKey('file', filePath)
      : null

    const entries = map.entries()
    for (const entry of entries) {
      const key = entry[0]
      const item = entry[1]
      if (item.filePath === filePath) {
        map.delete(key)
      } else if (
        fileDependencyKey &&
        item.dependencies &&
        item.dependencies.includes(fileDependencyKey)
      ) {
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
    this.purgeFromMap(this.operations, filePath)
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
   *
   * @throws {@link FragmentNotFoundError} if the fragment could not be found.
   */
  private getFragmentNode(name: string): FragmentDefinitionNode {
    const item = this.fragments.get(name)
    if (!item) {
      throw new FragmentNotFoundError(name, this.getErrorContext())
    }

    // We have to call this.
    this.generateFragmentType(name)

    return item.node
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

  /**
   * Get or create the given type helper.
   *
   * @param type - The type helper.
   *
   * @returns The name of the generated type helper.
   *
   * @throws {@link LogicError} if the helper type could not be found.
   */
  private getOrCreateTypeHelper(type: 'exact' | 'maybe'): string {
    if (type === 'exact') {
      return this.generateCodeOnce('type-helpers', type, () => {
        return {
          typeName: 'Exact',
          code: `type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };`,
        }
      })
    } else if (type === 'maybe') {
      return this.generateCodeOnce('type-helpers', type, () => {
        return {
          typeName: 'Maybe',
          code: `type Maybe<T> = T | null;`,
        }
      })
    }

    throw new LogicError('Invalid helper type: ' + type)
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
        source: null,
        graphqlName: type.name,
        identifier: 'enum',
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
   *
   * @throws {@link TypeNotFoundError} if the type could not be found.
   */
  private createInputTS(typeNode: TypeNode): string {
    return this.withCache(
      'createInputTS',
      () => getTypeNodeKey(typeNode),
      () => {
        const { type, isNonNull } = unwrapNonNull(typeNode)

        let output = 'any'

        if (type.kind === Kind.LIST_TYPE) {
          const element = this.createInputTS(type.type)
          output = this.toArrayString(element)
        } else if (type.kind === Kind.NAMED_TYPE) {
          const namedType = this.schema.getType(type.name.value)
          output = this.IRToCode(this.buildOutputTypeIR(namedType))
        }

        if (!isNonNull) {
          output += ' | null'
        }

        return output
      },
    )
  }

  /**
   * Generate the code for the given input type.
   *
   * @param type - The input type.
   *
   * @returns The TS name of the type.
   *
   * @throws {@link LogicError} when the AST node is missing on the input field.
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
        graphQLTypeName: '',
        description: type.description,
      })

      return {
        code: makeExport(typeName, this.objectNodeToCode(obj)),
        typeName,
        context: { definition: type.astNode, type },
        source: null,
        graphqlName: type.name,
        identifier: 'input',
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
   *
   * @throws {@link FragmentNotFoundError} if the fragment does not exist.
   * @throws {@link TypeNotFoundError} if the fragment's condition type does not exist.
   */
  private generateFragmentType(fragmentName: string): string {
    return this.generateCodeOnce('fragment', fragmentName, () => {
      const item = this.fragments.get(fragmentName)

      if (!item) {
        throw new FragmentNotFoundError(fragmentName, this.getErrorContext())
      }
      const source = getAstSource(item.node)
      const typeName = this.options.buildFragmentTypeName(item.node)

      const graphqlTypeName = item.node.typeCondition.name.value
      const type = this.schema.getType(graphqlTypeName)

      this.dependencyTracker?.start()
      this.dependencyTracker?.addFragment(fragmentName)
      const ir = this.buildSelectionSet(type, item.node.selectionSet)
      const processedIR = postProcessIR(ir)
      const dependencies = this.dependencyTracker?.end() || []
      this.fragmentIRs.set(item.node.name.value, {
        map: buildFragmentIRFields(processedIR),
        dependencies,
        filePath: this.dependencyTracker?.getCurrentFile() || NO_FILE_PATH,
      })
      const code = makeExport(typeName, this.IRToCode(processedIR))

      return {
        code,
        typeName,
        context: {
          filePath: item.filePath,
          definition: item.node,
        },
        source,
        graphqlName: fragmentName,
        identifier: 'fragment',
      }
    })
  }

  // ===========================================================================
  // Operations
  // ===========================================================================

  /**
   * Inline fragments for root operations.
   */
  private inlineFragments(
    selectionSet: SelectionSetNode,
    currentTypeName: string,
  ): SelectionSetNode {
    let hasChanged = false
    const newSelections: SelectionNode[] = []

    for (const spread of selectionSet.selections) {
      if (spread.kind === Kind.FRAGMENT_SPREAD) {
        this.dependencyTracker?.addFragment(spread.name.value)
        const fragDef = this.getFragmentNode(spread.name.value)
        if (
          fragDef &&
          fragDef.typeCondition &&
          fragDef.typeCondition.name.value === currentTypeName
        ) {
          // Inline the fragment's selections
          newSelections.push(...fragDef.selectionSet.selections)
          hasChanged = true
        } else {
          newSelections.push(spread)
        }
      } else {
        newSelections.push(spread)
      }
    }

    if (hasChanged) {
      // If we inlined anything, we might now have newly inlined fragment spreads,
      // so recurse again until stable.
      const updatedSet: SelectionSetNode = {
        kind: Kind.SELECTION_SET,
        selections: newSelections,
      }
      return this.inlineFragments(updatedSet, currentTypeName)
    }

    // No changes => done.
    return selectionSet
  }

  /**
   * Generates the types for an operation.
   *
   * @param operation - The operation node.
   * @param input - The input document.
   *
   * @throws {@link MissingRootTypeError} If the root type is unsupported.
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

    const rootType = this.schema.getRootType(operation)
    if (!rootType) {
      throw new MissingRootTypeError(
        operation.name.value,
        this.getErrorContext(),
      )
    }

    const typeName = this.options.buildOperationTypeName(
      opName,
      rootType,
      operation,
    )

    const variablesTypeName = this.options.buildOperationVariablesTypeName(
      opName,
      rootType,
      operation,
    )

    this.dependencyTracker?.start()

    this.generateCodeOnce('operation', opName + '-base', () => {
      this.logDebug('Generating operation: ' + opName)
      const inlined = this.inlineFragments(
        operation.selectionSet,
        rootType.name,
      )
      const merged = mergeSameFieldSelections(inlined)
      const source = getAstSource(operation)

      return {
        code: makeExport(
          typeName,
          this.IRToCode(
            postProcessIR(this.buildSelectionSet(rootType, merged)),
          ),
        ),
        context: { input, definition: operation },
        typeName,
        source,
        graphqlName: opName,
        identifier: operation.operation,
      }
    })

    this.generateCodeOnce('operation-variables', opName + '-variables', () => {
      const exact = this.getOrCreateTypeHelper('exact')
      const typeCode = operation.variableDefinitions?.length
        ? this.objectNodeToCode(
            IR.OBJECT({
              graphQLTypeName: '',
              fields: operation.variableDefinitions.reduce<
                Record<string, IRNode>
              >((acc, vd) => {
                acc[vd.variable.name.value] = IR.SCALAR({
                  tsType: this.createInputTS(vd.type),
                  nullable: vd.type.kind !== Kind.NON_NULL_TYPE,
                })
                return acc
              }, {}),
            }),
          )
        : `{ [key: string]: never; }`
      const code = makeExport(variablesTypeName, `${exact}<${typeCode}>`)
      return {
        code,
        typeName: variablesTypeName,
        context: { input },
        source: null,
        graphqlName: null,
        identifier: null,
      }
    })
    const dependencies = this.dependencyTracker?.end() || []

    if (this.operations.has(opName)) {
      return
    }

    const hasVariables = !!operation.variableDefinitions?.length

    const needsVariables = !operation.variableDefinitions?.every((v: any) => {
      return v.defaultValue
    })

    this.operations.set(opName, {
      operationType: operation.operation,
      graphqlName: opName,
      typeName,
      variablesTypeName,
      needsVariables,
      hasVariables,
      dependencies,
      filePath: this.dependencyTracker?.getCurrentFile() || NO_FILE_PATH,
      timestamp: Date.now(),
    })
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
   *
   * @throws {@link TypeNotFoundError} if the type does not exist.
   * @throws {@link LogicError} when attempting to create a object type name for an abstract type.
   */
  private getOrCreateObjectTypeName(arg: string | GraphQLObjectType): string {
    const name = typeof arg === 'string' ? arg : arg.name
    return this.generateCodeOnce('typename-object', name, () => {
      const type = typeof arg === 'string' ? this.schema.getType(name) : arg

      if (!isObjectType(type)) {
        throw new LogicError(
          'Attempted to create object type string literal for non-object type: ' +
            name,
          this.getErrorContext(),
        )
      }

      return {
        code: `type ${name} = '${name}';`,
        typeName: name,
        context: { type },
        source: null,
        graphqlName: type.name,
        identifier: 'type',
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
  private getOrCreateUnionTypenameType(
    type: GraphQLInterfaceType | GraphQLUnionType,
  ): string {
    return this.generateCodeOnce('typename-union', type.name, () => {
      const implementingTypes = this.schema.getPossibleTypes(type)
      let union =
        implementingTypes
          .map((v) => this.getOrCreateObjectTypeName(v))
          .sort()
          .join(' | ') || 'never'

      const totalLength = `export type ${type.name} =`.length + union.length

      // If we exceed 80 chars, switch to a union where each type is on a new line.
      if (totalLength > 80) {
        union = union
          .split(' | ')
          .map((v) => {
            return `\n  | ${v}`
          })
          .join('')
      }

      return {
        code: makeExport(type.name, union),
        typeName: type.name,
        context: {
          type,
        },
        source: null,
        graphqlName: type.name,
        identifier: 'union',
      }
    })
  }

  // ===========================================================================
  // AST/IR
  // ===========================================================================

  /**
   * Create an array from the given type string.
   *
   * @param type - The string containing a valid TS type.
   *
   * @returns The type as an array.
   */
  private toArrayString(type: string): string {
    const shape = this.options.output.arrayShape
    // We can directly pass in the type because the shape uses < and >.
    if (shape.includes('<') && shape.includes('>')) {
      return shape.replace('$T$', type)
    }

    // Check if we have any unions or intersections.
    if (type.includes('|') || type.includes('&')) {
      // Wrap the type in parantheses so we produce valid syntax.
      return shape.replace('$T$', `(${type})`)
    }

    // We can safely replace it with e.g. `string[]`.
    return shape.replace('$T$', type)
  }

  /**
   * Create an array from the given type string.
   *
   * @param type - The string containing a valid TS type.
   *
   * @returns The type as an array.
   */
  private fieldToCode(
    type: string,
    nullable = false,
    optional = false,
  ): string {
    const nullableField = this.options.output.nullableField
    const prefix =
      (nullableField === 'optional' && nullable) || optional ? '?: ' : ': '
    if (!nullable) {
      return prefix + type + ';'
    }
    if (nullableField === 'null') {
      return `${prefix}${type} | null;`
    } else if (nullableField === 'optional') {
      return `${prefix}${type};`
    } else {
      return `${prefix}${this.getOrCreateTypeHelper('maybe')}<${type}>;`
    }
  }

  /**
   * Builds the IR for the selection set.
   *
   * @param type - The GraphQL type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR node for the selection.
   *
   * @throws {@link LogicError} if the provided type does not provide a selection set.
   */
  private buildSelectionSet(
    type: GraphQLNamedType,
    selectionSet: SelectionSetNode,
  ): IRNode {
    if (isObjectType(type)) {
      return this.buildObjectSelectionSet(type, selectionSet)
    } else if (isAbstractType(type)) {
      return this.buildAbstractSelectionSet(type, selectionSet)
    }

    // We should never actually end up here, as there is no selection set for any other types.
    throw new LogicError(
      'Cannot build selection set for type: ' + type.name,
      this.getErrorContext(),
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
   *
   * @throws {@link LogicError} if the IR for the fragment could not be built. This can happen when there are circular dependencies between fragments.
   */
  private getFragmentIRFields(fragmentName: string): Record<string, IRNode> {
    return this.withCache('getFragmentIRFields', fragmentName, () => {
      let item = this.fragmentIRs.get(fragmentName)

      // This means the fragment has not yet been created.
      if (!item) {
        // Generate the actual fragment IR.
        // If successful, this will store the IR of the fragment.
        this.generateFragmentType(fragmentName)
        item = this.fragmentIRs.get(fragmentName)
      }

      if (!item) {
        // Likely means there are circular references between two or more
        // fragments and we are trying to generated the IR recursively.
        // As this is anyway not allowed in the spec, throw an error.
        throw new LogicError(
          `Failed to generate IR for fragment: "${fragmentName}". There are likely circular dependencies between fragments.`,
          this.getErrorContext(),
        )
      }
      return item.map
    })
  }

  /**
   * Build the IR of the selection set of an object type.
   *
   * @param objectType - The object type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR for the selections.
   *
   * @throws {@link FieldNotFoundError} When a selected field does not exist on the type.
   * @throws {@link LogicError} When an inline fragment has no type condition.
   * @throws {@link TypeNotFoundError} When a type could not be found.
   */
  private buildObjectSelectionSet(
    objectType: GraphQLObjectType,
    selectionSet: SelectionSetNode,
  ): IRNode {
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
          // Continue since __typename is not a field that exists.
          continue
        }

        const alias = sel.alias?.value || sel.name.value
        const fieldDef = objFields[sel.name.value]
        if (!fieldDef) {
          throw new FieldNotFoundError(
            sel.name.value,
            objectType.name,
            this.getErrorContext(),
          )
        }
        const fieldIR = this.buildFieldIRFromFieldDef(fieldDef, sel)
        const current = fields[alias]
        fields[alias] = current ? mergeIR(current, fieldIR) : fieldIR
      } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragName = sel.name.value
        const fragDef = this.getFragmentNode(fragName)

        // If the fragment's typeCondition is the same or an interface the object implements, merge it.
        const condName = fragDef.typeCondition.name.value
        if (
          condName === objectType.name ||
          this.schema.objectImplements(objectType.name, condName)
        ) {
          const fragTypeName = this.options.buildFragmentTypeName(fragDef)
          mergeFragmentSpread(
            fields,
            IR.FRAGMENT_SPREAD({
              name: fragName,
              fragmentTypeName: fragTypeName,
              parentType: objectType.name,
              fragmentTypeCondition: condName,
            }),
          )
        }
      } else if (sel.kind === Kind.INLINE_FRAGMENT) {
        const typeConditionName = sel.typeCondition?.name.value
        if (!typeConditionName) {
          throw new LogicError(
            'Inline fragment has no type condition.',
            this.getErrorContext(),
          )
        }
        const spreadType = this.schema.getType(typeConditionName)
        const ir = this.buildSelectionSet(spreadType, sel.selectionSet)
        if (ir.kind === 'OBJECT') {
          mergeObjectFields(fields, ir.fields)
        } else if (ir.kind === 'UNION') {
          for (const branch of ir.types) {
            if (
              branch.kind === 'OBJECT' &&
              branch.graphQLTypeName === typeConditionName
            ) {
              mergeObjectFields(fields, branch.fields)
            }
          }
        }
      }
    }

    // Always add __typename field if option is set.
    if (this.options.output.nonOptionalTypename && !fields[TYPENAME]) {
      fields[TYPENAME] = IR.TYPENAME(this.getOrCreateObjectTypeName(objectType))
    }

    const result = IR.OBJECT({
      graphQLTypeName: objectType.name,
      fields,
    })

    return result
  }

  /**
   * Apply code formatting.
   *
   * @param code - The code to format.
   *
   * @returns The formatted code.
   */
  private formatCode(code: string): string {
    if (this.options.output.formatCode === true) {
      return formatCode(code)
    } else if (typeof this.options.output.formatCode === 'function') {
      return this.options.output.formatCode(code)
    }

    return code
  }

  /**
   * Return a scalar node for an empty object.
   */
  private emptyObjectScalar(): IRNodeScalar {
    return IR.SCALAR({
      tsType: this.options.output.emptyObject,
    })
  }

  /**
   * Generate the IR selection set for an abstract (interface, union) type.
   *
   * @param abstractType - The interface/union type.
   * @param selectionSet - The selection set node.
   *
   * @returns The IR node for the selection.
   *
   * @throws {@link FieldNotFoundError} When a field was selected that does not exist.
   * @throws {@link LogicError} When an inline fragment is missing a type condition.
   * @throws {@link TypeNotFoundError} When a type does not exist.
   */
  private buildAbstractSelectionSet(
    abstractType: GraphQLAbstractType,
    selectionSet: SelectionSetNode,
  ): IRNode {
    const selections = selectionSet.selections

    const abstractTypeFields = isInterfaceType(abstractType)
      ? abstractType.getFields()
      : {}

    // Possible types that implement the interface/union.
    const possibleTypes = this.schema.getPossibleObjectTypeNames(
      abstractType.name,
    )
    const totalPossibleTypes = possibleTypes.length

    // Fields requested on interface/union level.
    const baseFields: Record<string, IRNode> = {}
    const fragmentsByConcreteType: Record<string, FragmentDefinitionNode[]> = {}
    const fragmentsForAbstract: FragmentDefinitionNode[] = []

    const inlineFragmentsByConcreteType: Record<string, InlineFragmentNode[]> =
      {}

    const inlineFragmentsForAbstract: InlineFragmentNode[] = []

    // Always __typename field if option is set.
    if (this.options.output.nonOptionalTypename) {
      baseFields[TYPENAME] = IR.TYPENAME(
        this.getOrCreateUnionTypenameType(abstractType),
      )
    }

    for (const sel of selections) {
      if (sel.kind === Kind.FIELD) {
        const fieldName = sel.name.value
        const aliasName = sel.alias?.value || fieldName
        if (fieldName === TYPENAME) {
          if (!hasTypenameField(baseFields)) {
            baseFields[aliasName] = IR.TYPENAME(
              this.getOrCreateUnionTypenameType(abstractType),
            )
          }
        }
        // If it's an interface, we can also gather interface-level fields directly
        else if (isInterfaceType(abstractType)) {
          const fieldDef = abstractTypeFields[fieldName]
          if (!fieldDef) {
            throw new FieldNotFoundError(
              fieldName,
              abstractType.name,
              this.getErrorContext(),
            )
          }
          const fieldIR = this.buildFieldIRFromFieldDef(fieldDef, sel)
          const current = baseFields[aliasName]
          baseFields[aliasName] = current ? mergeIR(current, fieldIR) : fieldIR
        }
      } else if (sel.kind === Kind.INLINE_FRAGMENT) {
        if (!sel.typeCondition) {
          throw new LogicError(
            'Missing type condition in inline fragment.',
            this.getErrorContext(),
          )
        }
        const typeConditionName = sel.typeCondition?.name.value
        if (typeConditionName === abstractType.name) {
          inlineFragmentsForAbstract.push(sel)
        } else {
          if (!inlineFragmentsByConcreteType[typeConditionName]) {
            inlineFragmentsByConcreteType[typeConditionName] = []
          }
          inlineFragmentsByConcreteType[typeConditionName].push(sel)
        }
      } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragmentName = sel.name.value
        const fragment = this.getFragmentNode(fragmentName)
        const typeConditionName = fragment.typeCondition.name.value
        // A fragment on the abstract type.
        if (typeConditionName === abstractType.name) {
          fragmentsForAbstract.push(fragment)
        } else {
          if (!fragmentsByConcreteType[typeConditionName]) {
            fragmentsByConcreteType[typeConditionName] = []
          }
          fragmentsByConcreteType[typeConditionName].push(fragment)
        }
      }
    }

    const concreteInlineFragmentTypes = Object.keys(
      inlineFragmentsByConcreteType,
    )
    const concreteFragmentTypes = Object.keys(fragmentsByConcreteType)

    const hasBaseFields = Object.keys(baseFields).length > 0
    const hasInlineFragmentsForAbstract = inlineFragmentsForAbstract.length > 0
    const hasFragmentsForAbstract = fragmentsForAbstract.length > 0

    const hasConcreteInlineFragments = concreteInlineFragmentTypes.length > 0
    const hasConcreteFragments = concreteFragmentTypes.length > 0

    // ====================================================================
    // Shortcuts for common use cases.
    //
    // This section is very verbose, because we try to find common
    // combinations of selections for which we can return an IR node
    // directly, without the overhead of generating a union branch for every
    // implementing type.
    // ====================================================================

    // We don't have any base fields.
    if (!hasBaseFields) {
      // We only have fragments for abstract.
      if (
        !hasInlineFragmentsForAbstract &&
        hasFragmentsForAbstract &&
        !hasConcreteInlineFragments &&
        !hasConcreteFragments
      ) {
        // We can only return if there is exactly one fragment.
        if (fragmentsForAbstract.length === 1) {
          return IR.SCALAR({
            tsType: this.generateFragmentType(
              fragmentsForAbstract[0]!.name.value,
            ),
          })
        }
      }
      // We only have concrete fragment spreads.
      else if (
        !hasInlineFragmentsForAbstract &&
        !hasFragmentsForAbstract &&
        !hasConcreteInlineFragments &&
        hasConcreteFragments
      ) {
        // We only have spreads for a single type.
        if (concreteFragmentTypes.length === 1) {
          const typeName = concreteFragmentTypes[0]!
          const fragments = fragmentsByConcreteType[typeName]!

          // We have just a single fragment.
          if (fragments.length === 1) {
            return IR.SCALAR({
              tsType: this.generateFragmentType(fragments[0]!.name.value),
            })
          }
        } else {
          // We have exactly one fragment per type.
          const allTargetDifferent = concreteFragmentTypes.every((typeName) => {
            const fragments = fragmentsByConcreteType[typeName]!
            return fragments.length === 1
          })

          if (allTargetDifferent) {
            // If all fragment spreads target different types we can create an
            // union type.
            const unionTypes = concreteFragmentTypes.map((typeName) => {
              const fragment = fragmentsByConcreteType[typeName]![0]!
              return IR.SCALAR({
                tsType: this.generateFragmentType(fragment.name.value),
              })
            })
            const totalTargets = concreteFragmentTypes.length

            // If there are still types left that aren't targeted by any of the
            // fragments: Add an empty object.
            if (totalTargets !== totalPossibleTypes) {
              unionTypes.push(this.emptyObjectScalar())
            }
            return IR.UNION({
              types: unionTypes,
            })
          }
        }
      }
    }

    // ====================================================================
    // Full gathering of all possible combinations.
    //
    // This creates a branch for every possible type to create a union node
    // of all possible object shapes. This is what allows us to check for
    // field conflicts between spreads on the same type later on.
    // ====================================================================

    // Stores inline fragment fields for each implementing object type.
    // Key is name of object type, value is an object of fields => node.
    const objectTypeMap = new Map<string, Record<string, IRNode>>()

    // Gather all field selections on interface/union level.
    for (const sel of selections) {
      if (sel.kind === Kind.INLINE_FRAGMENT) {
        const typeConditionName = sel.typeCondition?.name.value
        if (!typeConditionName) {
          throw new LogicError(
            'Inline fragment has no type condition.',
            this.getErrorContext(),
          )
        }

        const spreadType = this.schema.getType(typeConditionName)

        // Build the IR node for the selection for this object type.
        const ir = this.buildSelectionSet(spreadType, sel.selectionSet)

        // For each object type that implements typeConditionName, merge its IR.
        for (const possibleTypeName of possibleTypes) {
          if (
            possibleTypeName === typeConditionName ||
            this.schema.objectImplements(possibleTypeName, typeConditionName)
          ) {
            const type = this.schema.getType(possibleTypeName)!
            if (ir.kind === 'OBJECT') {
              const merged = mergeObjectFields(
                objectTypeMap.get(type.name) || {},
                ir.fields,
              )
              objectTypeMap.set(type.name, merged)
            } else if (ir.kind === 'UNION') {
              for (const branch of ir.types) {
                if (
                  branch.kind === 'OBJECT' &&
                  branch.graphQLTypeName === type.name
                ) {
                  const merged = mergeObjectFields(
                    objectTypeMap.get(type.name) || {},
                    branch.fields,
                  )
                  objectTypeMap.set(type.name, merged)
                }
              }
            }
          }
        }
      } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragName = sel.name.value
        const fragment = this.getFragmentNode(fragName)

        const typeConditionName = fragment.typeCondition.name.value
        const typeConditionType = this.schema.getType(typeConditionName)

        if (isObjectType(typeConditionType)) {
          const fragTypeName = this.options.buildFragmentTypeName(fragment)
          const existing = objectTypeMap.get(typeConditionType.name) || {}
          mergeFragmentSpread(
            existing,
            IR.FRAGMENT_SPREAD({
              name: fragment.name.value,
              fragmentTypeName: fragTypeName,
              parentType: abstractType.name,
              fragmentTypeCondition: fragment.typeCondition.name.value,
            }),
          )
          objectTypeMap.set(typeConditionType.name, existing)
        } else if (isAbstractType(typeConditionType)) {
          const ir = this.buildSelectionSet(
            typeConditionType,
            fragment.selectionSet,
          )

          if (ir.kind === 'OBJECT') {
            const merged = mergeObjectFields(
              objectTypeMap.get(ir.graphQLTypeName) || {},
              ir.fields,
            )
            objectTypeMap.set(ir.graphQLTypeName, merged)
          } else if (ir.kind === 'UNION') {
            for (const branch of ir.types) {
              if (branch.kind === 'OBJECT') {
                const merged = mergeObjectFields(
                  objectTypeMap.get(branch.graphQLTypeName) || {},
                  branch.fields,
                )
                objectTypeMap.set(branch.graphQLTypeName, merged)
              }
            }
          }
        }
      }
    }

    const branches: IRNode[] = []
    const typesWithFragments = new Set(objectTypeMap.keys())
    const typesWithoutFragments = possibleTypes.filter(
      (v) => !typesWithFragments.has(v),
    )
    const excludedTypeCount = typesWithFragments.size
    const remainingCount = possibleTypes.length - excludedTypeCount
    const hasTypename = hasTypenameField(baseFields)
    let unionIrNode: IRNodeTypename | null = null

    for (const objectTypeName of possibleTypes) {
      // Clone the base fields.
      const mergedFields = { ...baseFields }

      // If user had an inline fragment for the type, merge those fields.
      const subtypeFields = objectTypeMap.get(objectTypeName)
      if (subtypeFields) {
        mergeObjectFields(mergedFields, subtypeFields)
      }

      if (hasTypename) {
        if (
          typesWithFragments.has(objectTypeName) ||
          !this.options.output.mergeTypenames
        ) {
          // If this type has fragments, its __typename should be the name of the object type.
          mergedFields[TYPENAME] = IR.TYPENAME(
            this.getOrCreateObjectTypeName(objectTypeName),
          )
        } else if (typesWithFragments.size > 0) {
          // Only use the Exclude<> for __typename when we have enough remaining types.
          // Else we would be creating an exclude argument that is longer than the actual
          // remaining types.
          // Also cache the created node so we don't call it for every type iteration.
          if (
            unionIrNode === null &&
            remainingCount > excludedTypeCount &&
            remainingCount > 2
          ) {
            // This is a fallback type (no inline fragments), and some types have fragments.
            // We can use Exclude<Interface, TypesWithFragments> to
            const excludedTypes = Array.from(typesWithFragments).map((name) =>
              this.getOrCreateObjectTypeName(name),
            )
            unionIrNode = IR.TYPENAME(
              excludedTypes,
              this.getOrCreateUnionTypenameType(abstractType),
            )
          }

          if (unionIrNode) {
            mergedFields[TYPENAME] = unionIrNode
          } else {
            mergedFields[TYPENAME] = IR.TYPENAME(typesWithoutFragments)
          }
        }
      }

      branches.push(
        IR.OBJECT({
          graphQLTypeName: objectTypeName,
          fields: mergedFields,
        }),
      )
    }

    // No branches: Produce an empty object.
    if (branches.length === 0) {
      return IR.OBJECT({
        graphQLTypeName: abstractType.name,
        fields: {},
      })
    } else if (branches.length === 1) {
      // Just one branch: We can return it directly.
      return branches[0]!
    }

    return IR.UNION({
      types: branches,
    })
  }

  /**
   * Merges an object with fragment spreads and inline fields.
   *
   * If we detect a conflict between nested selections from inline spreads or
   * fragment spreads, we inline the entire field. We still use the fragment type if
   * possible, however, we exclude the conflicting fields from the fragment using Omit<>.
   *
   * @TODO: This could already be handled when building the selection set.
   *
   * @param fields - The field map.
   * @param spreads - The collected fragment spread IR nodes.
   *
   * @returns The output or null if no conflicts exist.
   */
  private mergeFragmentSpreads(
    fields: Map<string, IRNode>,
    spreads: IRNodeFragmentSpread[],
  ): string {
    // No fragment spreads.
    if (spreads.length === 0) {
      return ''
    }

    const hasOnlyTypename = fields.has(TYPENAME) && fields.size === 1

    if (!fields.size || (hasOnlyTypename && spreads.length === 1)) {
      return spreads.map((v) => v.fragmentTypeName).join(' & ')
    }

    this.incrementDebugCount('mergeFragmentSpreads')

    // Map of all fields keyed by name of fragment.
    const fragmentFieldMaps: Record<string, Record<string, IRNode>> = {}

    for (const spread of spreads) {
      const fragmentFields = this.getFragmentIRFields(spread.name)
      fragmentFieldMaps[spread.fragmentTypeName] = fragmentFields
    }

    // Gather a union of all field names from all fragments and direct fields.
    const allFieldNames = new Set<string>([
      ...fields.keys(),
      ...Object.values(fragmentFieldMaps).flatMap((fieldMap) =>
        Object.keys(fieldMap),
      ),
    ])

    // All fields for which we have a conflict.
    const conflictFields: Map<string, IRNode> = new Map()

    for (const fieldName of allFieldNames) {
      const nodes: IRNode[] = []

      // Add direct field if it exists
      const directField = fields.get(fieldName)
      if (directField) {
        nodes.push(directField)
      }

      // Add fields from fragments
      for (const spread of spreads) {
        const node = fragmentFieldMaps[spread.fragmentTypeName]?.[fieldName]
        if (node) {
          nodes.push(node)
        }
      }

      if (nodes.length <= 1) {
        // No conflict if only one source has it
        continue
      }

      // We unify them
      let merged = nodes[0]!
      let conflictFound = false
      for (let i = 1; i < nodes.length; i++) {
        const next = nodes[i]!
        // If mergeIR(...) yields a 'UNION' or if the shapes differ, we consider that a conflict
        const m = mergeIR(merged, next)
        // If m is a union or differs from merged => conflict
        if (m.kind === 'UNION' || !isIdenticalIR(m, merged)) {
          conflictFound = true
        }
        merged = m
      }

      if (
        conflictFound &&
        !conflictFields.has(fieldName) &&
        fieldName !== TYPENAME
      ) {
        conflictFields.set(fieldName, merged)
      }
    }

    // When there are no conflicts found: Return a simple intersection.
    if (conflictFields.size === 0) {
      const codeFields = this.fieldMapToCode(fields)
      return [codeFields, ...spreads.map((v) => v.fragmentTypeName)].join(' & ')
    }

    // Create objects for our intersection.
    const intersectionParts: string[] = []

    // Handle direct fields (excluding those that are in conflicts).
    const nonConflictingDirectFields = new Map(fields)
    for (const fieldName of conflictFields.keys()) {
      nonConflictingDirectFields.delete(fieldName)
    }

    // Add direct fields as an object if there are any non-conflicting fields.
    if (nonConflictingDirectFields.size > 0) {
      intersectionParts.push(this.fieldMapToCode(nonConflictingDirectFields))
    }

    // Add fragments with Omit for conflicting fields.
    for (const spread of spreads) {
      const fragmentFields = fragmentFieldMaps[spread.fragmentTypeName]
      const allFragmentFieldNames = fragmentFields
        ? Object.keys(fragmentFields)
        : []

      // If there's a conflict field that the fragment actually defines, use Omit.
      const conflictsForThisFrag = [...conflictFields.keys()].filter((fld) => {
        return fragmentFields && fragmentFields[fld] !== undefined
      })

      // Skip fragment entirely if all of its fields are conflicting.
      if (conflictsForThisFrag.length === allFragmentFieldNames.length) {
        continue
      }

      // Start with the fragment name.
      let replacedType = spread.fragmentTypeName

      // Apply Omit for conflicting fields.
      if (conflictsForThisFrag.length > 0) {
        const omitFields = conflictsForThisFrag.map((f) => `"${f}"`).join(' | ')
        replacedType = `Omit<${spread.fragmentTypeName}, ${omitFields}>`
      }

      intersectionParts.push(replacedType)
    }

    // Add merged conflict fields as a separate object into the intersection.
    if (conflictFields.size > 0) {
      intersectionParts.unshift(this.fieldMapToCode(conflictFields))
    }

    if (intersectionParts.length === 0) {
      // No intersections: Empty object.
      return this.options.output.emptyObject
    } else if (intersectionParts.length === 1) {
      // Just one intersection.
      return intersectionParts[0]!
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
    const ir = this.buildOutputTypeIR(field.type, fieldNode.selectionSet)
    ir.nullable = !isNonNullType(field.type)
    ir.optional = hasConditionalDirective(fieldNode)
    if (this.typeCommentOptions.fieldDescription) {
      ir.description = field.description
    }
    return ir
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
      return this.buildOutputTypeIR(type.ofType, selectionSet)
    } else if (isListType(type)) {
      const innerType = type.ofType
      const innerIR = this.buildOutputTypeIR(innerType, selectionSet)
      return IR.ARRAY({
        ofType: innerIR,
        nullableElement:
          !isNonNullType(innerType) &&
          this.options.output.nullableArrayElements,
      })
    } else if (isObjectType(type)) {
      if (!selectionSet) {
        return IR.OBJECT({
          graphQLTypeName: type.name,
          fields: {},
        })
      }
      return this.buildSelectionSet(type, selectionSet)
    } else if (isAbstractType(type)) {
      if (!selectionSet) {
        return IR.OBJECT({
          graphQLTypeName: type.name,
          fields: {},
        })
      }
      return this.buildSelectionSet(type, selectionSet)
    } else if (isEnumType(type)) {
      return IR.SCALAR({ tsType: this.getOrCreateEnum(type) })
    } else if (isInputObjectType(type)) {
      return IR.SCALAR({
        tsType: this.getOrCreateInputType(type),
      })
    }

    return IR.SCALAR({
      tsType: this.options.buildScalarType(type) || 'any',
    })
  }

  /**
   * Generate the code for the given field map.
   *
   * @param fields - The field map.
   *
   * @return The generated code.
   */
  private fieldMapToCode(fields: Map<string, IRNode>): string {
    if (!fields.size) {
      return this.options.output.emptyObject
    }
    this.incrementDebugCount('fieldMapToCode')

    const fieldNames = [...fields.keys()]
    if (this.options.output.sortProperties) {
      fieldNames.sort()
    }

    let output = '{'

    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i]!
      const ir = fields.get(fieldName)!
      const tsType = this.IRToCode(ir)
      const field =
        fieldName + this.fieldToCode(tsType, ir.nullable, ir.optional)

      output += '\n'
      output += ir.description
        ? `${makeComment(ir.description)}\n${field}`
        : field
    }

    return output + '\n}'
  }

  /**
   * Convert an IR node to valid TypeScript code.
   *
   * @param ir - The IR node.
   *
   * @return The TS code of the node.
   */
  private IRToCode(ir: IRNode): string {
    this.incrementDebugCount('IRToCode')
    switch (ir.kind) {
      case 'SCALAR': {
        return ir.tsType
      }

      case 'TYPENAME': {
        const union = [...ir.types].sort().join(' | ')
        if (ir.excludeType) {
          // Special case for Exclude<A, B>: The provided types should be *excluded*
          // from the defined excludeType (which is either a GraphQL interface or union).
          return `Exclude<${ir.excludeType}, ${union}>`
        }
        return union
      }

      case 'OBJECT': {
        return this.objectNodeToCode(ir)
      }

      case 'ARRAY': {
        const elemTS = this.IRToCode(ir.ofType)
        const finalElem =
          ir.nullableElement && this.options.output.nullableArrayElements
            ? `${elemTS} | null`
            : elemTS
        return this.toArrayString(finalElem)
      }

      case 'UNION': {
        const parts = ir.types.map((t) => this.IRToCode(t)).sort()
        if (parts.length === 1) {
          return parts[0]!
        }
        return `(${parts.join(' | ')})`
      }

      case 'INTERSECTION': {
        const parts = ir.types.map((t) => this.IRToCode(t)).sort()
        if (parts.length === 1) {
          return parts[0]!
        }
        return `(${parts.join(' & ')})`
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
    this.incrementDebugCount('objectNodeToCode')
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
      return this.fieldMapToCode(otherFields)
    }

    return this.mergeFragmentSpreads(otherFields, fragmentSpreads)
  }

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Update the schema.
   *
   * Note that this will also reset the enire state.
   *
   * @param schema - The schema object.
   *
   * @returns Generator
   */
  public updateSchema(schema: GraphQLSchema): Generator {
    this.schema.update(schema)
    return this.reset()
  }

  /**
   * Add one or more documents or generator inputs.
   *
   * The documents must not have been previously been added. This is determined
   * by the provided filePath.
   *
   * @param arg - The GeneratorInput or DocumentNode or an array of those.
   *
   * @returns Generator
   *
   * @throws {@link DuplicateInputDocumentError} When an input document already exists.
   */
  public add(arg: GeneratorInputArgs): Generator {
    const docs = toInputDocuments(arg)

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]!
      if (this.inputDocuments.has(doc.filePath)) {
        throw new DuplicateInputDocumentError(doc.filePath)
      }
      this.inputDocuments.set(doc.filePath, doc)
    }

    return this
  }

  /**
   * Update on or more documents.
   *
   * @param arg - The GeneratorInput or DocumentNode or an array of those.
   *
   * @returns Generator
   *
   * @throws {@link LogicError} When attempting to update a document that does not exist.
   */
  public update(arg: GeneratorInputArgs): Generator {
    const docs = toInputDocuments(arg)

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]!
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
  public remove(filePath: string): Generator {
    this.purgeFilePath(filePath)
    return this
  }

  /**
   * Reset all caches and dependency tracker state.
   *
   * This keeps all added documents.
   */
  public resetCaches(): Generator {
    this.fragments.clear()
    this.operations.clear()
    this.generatedCode.clear()
    this.cache.clear()
    this.fragmentIRs.clear()
    this.dependencyTracker?.reset()
    return this
  }

  /**
   * Resets the entire state. This is equal to creating a new instance.
   *
   * - Remove all added input documents
   * - Remove all generated code
   * - Purge all caches.
   *
   * @returns Generator
   */
  public reset(): Generator {
    this.inputDocuments.clear()
    return this.resetCaches()
  }

  /**
   * Build the output from the current state.
   *
   * If any error happens during the build phase, the entire state (excluding
   * input documents) is reset, so that the state stays consistent. Any error
   * is rethrown.
   *
   * @returns The generator output.
   *
   * @throws {@link DependencyTrackingError} if there is an inconsistent dependency tracker state after the build phase.
   * @throws {@link TypeNotFoundError} if a requested type could not be found.
   * @throws {@link FragmentNotFoundError} if no fragment definition exists for a fragment spread.
   * @throws {@link FieldNotFoundError} if a non-existing field was selected
   * @throws {@link MissingRootTypeError} if the root type is unsupported.
   * @throws {@link LogicError} if there is a logical error during building. This can hint at a bug in the Generator.
   */
  public build(): GeneratorOutput {
    try {
      this.forEachDefinitionKind(Kind.FRAGMENT_DEFINITION, (node) => {
        this.fragments.set(node.name.value, {
          node,
          filePath: this.dependencyTracker?.getCurrentFile() || '',
          dependencies: [],
        })
      })

      // If false, always generate types for all fragments.
      // If true, the fragment type is only generated when it is first
      // encountered in an operation.
      if (!this.options.skipUnusedFragments) {
        this.forEachDefinitionKind(Kind.FRAGMENT_DEFINITION, (def) => {
          this.generateFragmentType(def.name.value)
        })
      }

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
    } catch (error) {
      // Reset caches so we don't run into inconsistent state.
      this.resetCaches()
      // Re-throw the error.
      throw error
    }

    // If we still have a remaining dependency tracker stack item at this point,
    // the code has a bug. Better throw an error here so it doesn't go unnoticed.
    if (this.dependencyTracker?.hasStack()) {
      throw new DependencyTrackingError(
        'Finished processing documents, but there is still a dependency tracker stack. This is likely due to a bug in the library. Set "dependencyTracking: false" to disable dependency tracking.',
      )
    }
    const code = this.generatedCode.values()
    return new GeneratorOutput(
      [...code, ...this.options.additionalOutputCode()],
      [...this.operations.values()],
    )
  }
}
