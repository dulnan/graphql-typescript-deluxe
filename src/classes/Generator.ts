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
  type FragmentSpreadNode,
  type GraphQLAbstractType,
  type GraphQLEnumType,
  type GraphQLField,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  type GraphQLNamedType,
  type GraphQLNullableType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type GraphQLType,
  type GraphQLUnionType,
  type InlineFragmentNode,
  type OperationDefinitionNode,
  type SelectionNode,
  type SelectionSetNode,
} from 'graphql'
import {
  getAstSource,
  getConditionalDirectives,
  getInlineFragmentTypeName,
  hasConditionalDirective,
  mergeSameFieldSelections,
} from '../helpers/ast'
import { unreachable } from '../helpers/unreachable'
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
  GeneratedCodeByOutputType,
  CollectedFragment,
} from '../types'
import { toInputDocuments } from '../helpers/generator'
import {
  DependencyTrackingError,
  DuplicateDefinitionError,
  DuplicateIdentifierError,
  DuplicateInputDocumentError,
  FieldNotFoundError,
  FragmentCycleError,
  FragmentNotFoundError,
  LogicError,
  MissingRootTypeError,
  type ErrorContext,
} from '../errors'
import {
  IR,
  buildFragmentIRFields,
  hasNestedSelections,
  hasRequiredTypenameField,
  hasTypenameField,
  isIdenticalIR,
  mergeFragmentSpread,
  mergeIR,
  mergeObjectFields,
  postProcessIR,
  typenameToCode,
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
import { pascalCase } from 'change-case'
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
  private fragments: Map<string, CollectedFragment> = new Map()

  /**
   * GraphQL type name => TS type name.
   *
   * To prevent infinite recursion we cache the names of generated input types
   * separately, because they might reference themselves recursively.
   */
  private generatedInputTypes: Map<string, string> = new Map()

  /**
   * All operation definitions.
   */
  private operations: Map<string, CollectedOperation> = new Map()

  /**
   * The generated code, by key, see generateCodeOnce().
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
   *
   * isObject is true if the TS type of the fragment is an object type, and
   * not a union.
   */
  private fragmentIRs: Map<
    string,
    {
      map: Record<string, IRNode>
      isObject: boolean
      filePath: string
      dependencies: string[]
    }
  > = new Map()

  /**
   * The names of the fragments whose type is being generated, outermost
   * first. Used to detect fragments that spread themselves.
   */
  private fragmentStack: string[] = []

  /**
   * The names of the TypeScript types that the output uses, such as Omit. A
   * generated type with the same name would replace them.
   */
  private globalTypeNames: Set<string>

  /**
   * Fragment name => the dependency keys of the fragments it spreads, directly
   * or through other fragments, and of itself last. Only used without
   * dependency tracking, see getUntrackedDependencies().
   */
  private untrackedFragmentDependencies: Map<string, string[]> = new Map()

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

    // The output can use these in any build. They are always reserved, so
    // that an unrelated operation can't make the build throw.
    this.globalTypeNames = new Set([
      'Exclude',
      'Omit',
      'Partial',
      'PropertyKey',
    ])
    const { arrayShape, emptyObject } = this.options.output
    for (const value of [arrayShape, emptyObject]) {
      for (const match of value
        .replaceAll('$T$', '')
        .matchAll(/[A-Za-z_]\w*/g)) {
        this.globalTypeNames.add(match[0])
      }
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
    input: GeneratorInputArgs,
    options?: GeneratorOptions,
  ): string {
    const docs = toInputDocuments(input)
    const generator = new Generator(schema, options)
    generator.add(docs)
    return generator.build().getOperations('ts').getSource()
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
    const filePath = this.dependencyTracker?.getCurrentFile() || ''
    const result = fn()
    const dependencies = this.dependencyTracker?.end() || []
    this.cache.set(cacheKey, {
      result,
      filePath,
      dependencies,
    })
    return result
  }

  /**
   * Generates the code only once.
   *
   * @param generatedTypeType - The code type.
   * @param key - The key, unique across all code types: Code for a schema type uses the name of the type, any other key contains a "-", which GraphQL names can't contain. A fragment can have the name of a schema type.
   * @param cb - The callback.
   *
   * @returns The name of the generated TS type.
   */
  private generateCodeOnce(
    generatedTypeType: GeneratedCodeType,
    key: string,
    cb: () => {
      code: string | GeneratedCodeByOutputType
      typeName: string
      graphqlName?: string | null
      context?: TypeContext
      identifier?: GeneratedCodeIdentifier | null
      source?: string | null
    },
    filePath?: string,
  ): string {
    const existing = this.generatedCode.get(key)
    if (existing) {
      this.dependencyTracker?.merge(existing)
      return existing.name
    }

    // The code belongs to the given file, or else to the current one.
    this.dependencyTracker?.start(filePath)
    const codeFilePath =
      this.dependencyTracker?.getCurrentFile() || filePath || ''
    const result = cb()
    this.dependencyTracker?.add(generatedTypeType, result.typeName)
    const dependencies = this.dependencyTracker
      ? this.dependencyTracker.end()
      : this.getUntrackedDependencies(result.context?.definition)

    let comment = ''
    if (result.context && this.options.output.typeComment) {
      const filePath = result.context.filePath || result.context.input?.filePath
      comment = makeTypeDoc(
        {
          ...result.context,
          filePath: filePath
            ? this.options.output.buildTypeDocFilePath(filePath)
            : undefined,
        },
        this.typeCommentOptions,
      )
    }
    const code: GeneratedCodeByOutputType = {}

    if (typeof result.code === 'string') {
      const formatted = this.formatCode(result.code)
      code['ts'] = formatted
      code['d.ts'] = formatted
    } else {
      for (const [type, resultCode] of Object.entries(result.code)) {
        code[type] = this.formatCode(resultCode)
      }
    }
    this.generatedCode.set(key, {
      id: DependencyTracker.toKey(generatedTypeType, result.typeName),
      type: generatedTypeType,
      name: result.typeName,
      code,
      comment,
      filePath: codeFilePath,
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
    name: string,
    map: Map<string, { filePath?: string; dependencies?: string[] }>,
    filePath: string,
  ): void {
    const fileDependencyKey = DependencyTracker.toKey('file', filePath)

    const entries = map.entries()
    for (const entry of entries) {
      const key = entry[0]
      const item = entry[1]
      if (item.filePath === filePath) {
        map.delete(key)
        this.logDebug(`purgeFromMap "${name}: ${filePath}"`)
      } else if (
        item.dependencies &&
        item.dependencies.includes(fileDependencyKey)
      ) {
        this.logDebug(`purgeFromMap "${name}: ${fileDependencyKey}"`)
        map.delete(key)
      }
    }
  }

  /**
   * Removes everything originating from the given file path.
   *
   * Without dependency tracking, all generated code is removed.
   *
   * @param filePath - The file path.
   */
  private purgeFilePath(filePath: string): Generator {
    this.inputDocuments.delete(filePath)

    // Without dependency tracking, it's unknown what depends on the file, so
    // the next build is a full build.
    if (!this.dependencyTracker) {
      return this.resetCaches()
    }

    this.purgeFromMap('fragments', this.fragments, filePath)
    this.purgeFromMap('generatedCode', this.generatedCode, filePath)
    this.purgeFromMap('cache', this.cache, filePath)
    this.purgeFromMap('fragmentIRs', this.fragmentIRs, filePath)
    this.purgeFromMap('operations', this.operations, filePath)
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
  private getOrCreateTypeHelper(
    type: 'exact' | 'maybe' | 'distributiveOmit' | 'oneOf',
  ): string {
    if (type === 'exact') {
      return this.generateCodeOnce('type-helpers', 'helper-exact', () => {
        return {
          typeName: 'Exact',
          code: `type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };`,
        }
      })
    } else if (type === 'distributiveOmit') {
      // Omit<> is not distributive: For a union, it only keeps the keys that
      // all types of the union have.
      return this.generateCodeOnce(
        'type-helpers',
        'helper-distributiveOmit',
        () => {
          return {
            typeName: 'DistributiveOmit',
            code: `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;`,
          }
        },
      )
    } else if (type === 'oneOf') {
      // Exactly one of the keys, the others must be left out.
      return this.generateCodeOnce('type-helpers', 'helper-oneOf', () => {
        return {
          typeName: 'OneOf',
          code: `type OneOf<T> = { [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never } }[keyof T];`,
        }
      })
    }

    return this.generateCodeOnce('type-helpers', 'helper-maybe', () => {
      return {
        typeName: 'Maybe',
        code: `type Maybe<T> = T | null;`,
      }
    })
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
   * Generate the TS code for the type of a variable or of an input field.
   *
   * This uses the schema type, not its AST node, so that it also works for
   * schemas without AST nodes (e.g. from `buildClientSchema()` or code-first).
   *
   * @param type - The type, including its list and non-null wrappers.
   *
   * @returns The TS code.
   */
  private createInputTS(type: GraphQLType): string {
    return this.withCache(
      'createInputTS',
      () => type.toString(),
      () =>
        isNonNullType(type)
          ? this.createNonNullInputTS(type.ofType)
          : this.createNonNullInputTS(type) + ' | null',
    )
  }

  /**
   * Generate the TS code for the type of a variable or input field, without
   * null.
   *
   * @param type - The type, without its non-null wrapper.
   *
   * @returns The TS code.
   */
  private createNonNullInputTS(type: GraphQLNullableType): string {
    return isListType(type)
      ? this.toArrayString(this.createInputTS(type.ofType))
      : this.IRToCode(this.buildOutputTypeIR(type))
  }

  /**
   * Build the IR for a variable or an input field.
   *
   * A nullable value may be left out or be null, independent of the
   * nullableField option. Only the null part uses the style of the option.
   *
   * @param type - The type, including its list and non-null wrappers.
   * @param hasDefault - Whether it has a default value.
   * @param description - The description.
   * @param isUsedAsNonNull - Whether a nullable variable is used where a non-null value is required, so it may be left out, but not be null.
   *
   * @returns The IR node.
   */
  private buildInputFieldIR(
    type: GraphQLType,
    hasDefault: boolean,
    description?: string | null,
    isUsedAsNonNull = false,
  ): IRNodeScalar {
    if (isNonNullType(type)) {
      // A non-null value can only be left out if it has a default value.
      return IR.SCALAR({
        tsType: this.createInputTS(type),
        optional: hasDefault,
        description,
      })
    }

    const tsType = this.createNonNullInputTS(type)
    if (isUsedAsNonNull) {
      return IR.SCALAR({ tsType, optional: true, description })
    }

    return IR.SCALAR({
      tsType:
        this.options.output.nullableField === 'maybe'
          ? `${this.getOrCreateTypeHelper('maybe')}<${tsType}>`
          : `${tsType} | null`,
      optional: true,
      description,
    })
  }

  /**
   * Get the variables of an operation that are used where a non-null value is
   * required, also in the fragments it spreads.
   *
   * @param operation - The operation definition.
   *
   * @returns The names of the variables.
   */
  private getNonNullVariables(operation: OperationDefinitionNode): Set<string> {
    const { nonNull, fragments } = this.schema.getVariableUsages(operation)
    const result = new Set(nonNull)
    const visited = new Set<string>()
    const queue = [...fragments]
    while (queue.length) {
      const fragmentName = queue.pop()!
      if (visited.has(fragmentName)) {
        continue
      }
      visited.add(fragmentName)
      const usages = this.withCache('getVariableUsages', fragmentName, () =>
        this.schema.getVariableUsages(this.getFragmentNode(fragmentName)),
      )
      usages.nonNull.forEach((name) => result.add(name))
      queue.push(...usages.fragments)
    }
    return result
  }

  /**
   * Generate the code for the given input type.
   *
   * @param type - The input type.
   *
   * @returns The TS name of the type.
   */
  private getOrCreateInputType(type: GraphQLInputObjectType): string {
    // It's possible to end up in (valid) infinite recursion here, because an
    // two input types might reference each other recursively *and* be used as
    // variable types in the same operation. In this case, they would
    // recursively try to generate a type for themselves.
    const existing = this.generatedInputTypes.get(type.name)
    if (existing) {
      return existing
    }

    const typeName = this.options.buildInputTypeName(type)
    this.generatedInputTypes.set(type.name, typeName)

    return this.generateCodeOnce('input', type.name, () => {
      // Exactly one field of a @oneOf input must be set, and it can't be
      // null. Its fields are always nullable in the schema.
      const isOneOf = !!type.isOneOf
      const fields = Object.entries(type.getFields()).reduce<
        Record<string, IRNode>
      >((acc, [name, field]) => {
        acc[name] = isOneOf
          ? IR.SCALAR({
              tsType: this.createNonNullInputTS(
                isNonNullType(field.type) ? field.type.ofType : field.type,
              ),
              description: field.description,
            })
          : this.buildInputFieldIR(
              field.type,
              this.schema.hasDefaultValue(field),
              field.description,
            )
        return acc
      }, {})

      const obj = IR.OBJECT({
        fields,
        graphQLTypeName: '',
        description: type.description,
      })
      const code = this.objectNodeToCode(obj)

      return {
        code: makeExport(
          typeName,
          isOneOf ? `${this.getOrCreateTypeHelper('oneOf')}<${code}>` : code,
        ),
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
    // The fragment can be generated while generating something from another
    // file, but its code belongs to the file of the fragment.
    const item = this.fragments.get(fragmentName)

    /* v8 ignore if -- @preserve */
    if (!item) {
      throw new FragmentNotFoundError(fragmentName, this.getErrorContext())
    }

    return this.generateCodeOnce(
      'fragment',
      fragmentName + '-fragment',
      () => {
        // Reached again while generating its own type: The fragment spreads
        // itself. On errors, the stack is cleared by resetCaches().
        const cycleStart = this.fragmentStack.indexOf(fragmentName)
        if (cycleStart !== -1) {
          throw new FragmentCycleError(
            [...this.fragmentStack.slice(cycleStart), fragmentName],
            this.getErrorContext(),
          )
        }

        const source = getAstSource(item.node)
        const typeName = this.options.buildFragmentTypeName(item.node)

        const graphqlTypeName = item.node.typeCondition.name.value
        const type = this.schema.getType(graphqlTypeName)

        this.fragmentStack.push(fragmentName)
        this.dependencyTracker?.start(item.filePath)
        this.dependencyTracker?.addFragment(fragmentName)
        const ir = this.buildSelectionSet(type, item.node.selectionSet)
        const processedIR = this.postProcessIR(ir)
        const dependencies = this.dependencyTracker
          ? this.dependencyTracker.end()
          : this.getUntrackedDependencies(item.node)
        this.fragmentIRs.set(item.node.name.value, {
          map: buildFragmentIRFields(processedIR),
          isObject: this.isObjectTypeIR(processedIR),
          dependencies,
          filePath: this.dependencyTracker ? item.filePath : NO_FILE_PATH,
        })
        this.fragmentStack.pop()
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
      },
      item.filePath,
    )
  }

  /**
   * Get the dependencies of a definition without dependency tracking.
   *
   * The operation documents need the fragments that an operation or fragment
   * spreads, so these are collected from the AST: nested fragments first, and
   * a fragment depends on itself, like the tracked ones. The tracked order
   * follows the order of generation, so the order can differ.
   *
   * @param definition - The definition of an operation or fragment.
   *
   * @returns The dependency keys of the fragments.
   */
  private getUntrackedDependencies(
    definition: DefinitionNode | null | undefined,
  ): string[] {
    if (definition?.kind === Kind.FRAGMENT_DEFINITION) {
      return this.getUntrackedFragmentDependencies(definition.name.value)
    } else if (definition?.kind === Kind.OPERATION_DEFINITION) {
      const collected = new Set<string>()
      this.collectUntrackedDependencies(definition.selectionSet, collected)
      return [...collected]
    }

    return []
  }

  /**
   * Get the dependency keys of the fragments a fragment spreads, directly or
   * through other fragments, and of the fragment itself last.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns The dependency keys.
   */
  private getUntrackedFragmentDependencies(fragmentName: string): string[] {
    let dependencies = this.untrackedFragmentDependencies.get(fragmentName)
    if (!dependencies) {
      // Fragment cycles already threw while generating the fragment types.
      const collected = new Set<string>()
      const fragment = this.fragments.get(fragmentName)
      if (fragment) {
        this.collectUntrackedDependencies(fragment.node.selectionSet, collected)
      }
      collected.add(DependencyTracker.toKey('fragment-name', fragmentName))
      dependencies = [...collected]
      this.untrackedFragmentDependencies.set(fragmentName, dependencies)
    }
    return dependencies
  }

  /**
   * Collect the dependency keys of the fragments spread in a selection set,
   * directly or through other fragments.
   *
   * @param selectionSet - The selection set.
   * @param collected - The collected dependency keys.
   */
  private collectUntrackedDependencies(
    selectionSet: SelectionSetNode,
    collected: Set<string>,
  ): void {
    for (const selection of selectionSet.selections) {
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        for (const key of this.getUntrackedFragmentDependencies(
          selection.name.value,
        )) {
          collected.add(key)
        }
      } else if (selection.selectionSet) {
        this.collectUntrackedDependencies(selection.selectionSet, collected)
      }
    }
  }

  /**
   * Whether the TS type of the IR is an object type, and not a union.
   *
   * An object that spreads a fragment whose type is a union is an
   * intersection with a union, which is a union too. Anything else, such as a
   * fragment type returned by a shortcut, may be a union.
   *
   * @param ir - The processed IR of a fragment.
   *
   * @returns True if the type is an object type.
   */
  private isObjectTypeIR(ir: IRNode): boolean {
    if (ir.kind !== 'OBJECT') {
      return false
    }

    return Object.values(ir.fields).every(
      (field) =>
        field.kind !== 'FRAGMENT_SPREAD' || this.isObjectFragment(field.name),
    )
  }

  /**
   * Whether the TS type of the fragment is an object type, and not a union.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns True if the type is an object type.
   */
  private isObjectFragment(fragmentName: string): boolean {
    // Generates the fragment and its IR, if that didn't happen yet.
    this.generateFragmentType(fragmentName)
    return this.fragmentIRs.get(fragmentName)?.isObject ?? false
  }

  /**
   * Merge the branches of unions that generate the same type, apart from
   * their __typename.
   *
   * @param ir - The IR node.
   *
   * @returns The processed IR node.
   */
  private postProcessIR(ir: IRNode): IRNode {
    return postProcessIR(ir, this.options.output.nullableField === 'optional')
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
        /* v8 ignore else -- @preserve */
        if (
          fragDef &&
          fragDef.typeCondition &&
          fragDef.typeCondition.name.value === currentTypeName
        ) {
          if (hasConditionalDirective(spread)) {
            // Keep the condition: Replace the spread with an inline fragment
            // with the same @include/@skip directives.
            newSelections.push({
              kind: Kind.INLINE_FRAGMENT,
              directives: getConditionalDirectives(spread),
              selectionSet: fragDef.selectionSet,
            })
          } else {
            // Inline the fragment's selections
            newSelections.push(...fragDef.selectionSet.selections)
          }
          hasChanged = true
          /* v8 ignore next -- @preserve */
        } else {
          /* v8 ignore next -- @preserve */
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
    // The types are named after the operation, so there is no name to give
    // them. Documented in add() and build().
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
    const filePath = input.filePath

    this.generateCodeOnce(
      'operation',
      opName + '-base',
      () => {
        this.logDebug('Generating operation: ' + opName)
        const inlined = this.inlineFragments(
          operation.selectionSet,
          rootType.name,
        )
        const merged = mergeSameFieldSelections(inlined)
        const source = getAstSource(operation)

        // Like Apollo's addTypenameToDocument and urql's formatDocument add
        // it, __typename is forced on every selection set except the root one
        // of an operation. A fragment spread there still adds it: The
        // fragment definition has its own selection set.
        const forceTypename =
          this.options.output.nonOptionalTypename &&
          operation.selectionSet.selections.some(
            (v) =>
              v.kind === Kind.FRAGMENT_SPREAD && !hasConditionalDirective(v),
          )

        return {
          code: makeExport(
            typeName,
            this.IRToCode(
              this.postProcessIR(
                this.buildSelectionSet(rootType, merged, false, forceTypename),
              ),
            ),
          ),
          context: { input, definition: operation },
          typeName,
          source,
          graphqlName: opName,
          identifier: operation.operation,
        }
      },
      filePath,
    )

    this.generateCodeOnce(
      'operation-variables',
      opName + '-variables',
      () => {
        const exact = this.getOrCreateTypeHelper('exact')
        // A nullable variable can't be null where a non-null value is required.
        const nonNullVariables = operation.variableDefinitions?.some(
          (vd) => vd.type.kind !== Kind.NON_NULL_TYPE,
        )
          ? this.getNonNullVariables(operation)
          : new Set<string>()
        const typeCode = operation.variableDefinitions?.length
          ? this.objectNodeToCode(
              IR.OBJECT({
                graphQLTypeName: '',
                fields: operation.variableDefinitions.reduce<
                  Record<string, IRNode>
                >((acc, vd) => {
                  acc[vd.variable.name.value] = this.buildInputFieldIR(
                    this.schema.getTypeFromNode(vd.type),
                    !!vd.defaultValue,
                    undefined,
                    nonNullVariables.has(vd.variable.name.value),
                  )
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
      },
      filePath,
    )
    // Without tracking, these are the fragments, which the code of the
    // operation already has.
    const dependencies = this.dependencyTracker
      ? this.dependencyTracker.end()
      : this.generatedCode.get(opName + '-base')?.dependencies || []

    if (this.operations.has(opName)) {
      return
    }

    const hasVariables = !!operation.variableDefinitions?.length

    // Variables are needed if one of them is non-null and has no default
    // value, so the variables type has a required key. graphql 17 leaves
    // empty AST collections undefined instead of [].
    const needsVariables = !!operation.variableDefinitions?.some(
      (v) => v.type.kind === Kind.NON_NULL_TYPE && !v.defaultValue,
    )

    this.operations.set(opName, {
      operationType: operation.operation,
      node: operation,
      graphqlName: opName,
      typeName,
      variablesTypeName,
      needsVariables,
      hasVariables,
      dependencies,
      filePath,
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

      /* v8 ignore start -- @preserve */
      if (!isObjectType(type)) {
        unreachable(
          'Attempted to create object type string literal for non-object type: ' +
            name,
        )
      }
      /* v8 ignore stop */

      const typeName = this.options.buildTypenameTypeName(type)
      return {
        code: `type ${typeName} = '${name}';`,
        typeName,
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

      const typeName = this.options.buildTypenameTypeName(type)
      const totalLength = `export type ${typeName} =`.length + union.length

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
        code: makeExport(typeName, union),
        typeName,
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
   * @param withBranches - For abstract types: Always return an object node for each possible type (as a union), instead of a shorter type such as a fragment type. Needed when the caller merges the fields of the object nodes.
   * @param forceTypename - For object types: Whether to add a __typename field. Defaults to the nonOptionalTypename option.
   *
   * @returns The IR node for the selection.
   *
   * @throws {@link LogicError} if the provided type does not provide a selection set.
   */
  private buildSelectionSet(
    type: GraphQLNamedType,
    selectionSet: SelectionSetNode,
    withBranches = false,
    forceTypename = this.options.output.nonOptionalTypename,
  ): IRNode {
    if (isObjectType(type)) {
      return this.buildObjectSelectionSet(type, selectionSet, forceTypename)
    } else if (isAbstractType(type)) {
      return this.buildAbstractSelectionSet(type, selectionSet, withBranches)
    }

    // We should never actually end up here, as there is no selection set for any other types.
    /* v8 ignore start -- @preserve */
    unreachable('Cannot build selection set for type: ' + type.name)
    /* v8 ignore stop */
  }

  /**
   * Returns the field map for the given fragment name.
   *
   * If the fragment does not yet exist, it will be created. This can happen
   * easily when we try to generate a fragment that spreads another fragment.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns The map, where the key is the name of the field and the value is the IR node.
   *
   * @throws {@link FragmentCycleError} if the fragment spreads itself, directly or through other fragments.
   * @throws {@link LogicError} if the IR for the fragment could not be built.
   */
  private getFragmentIRFields(fragmentName: string): Record<string, IRNode> {
    return this.withCache('getFragmentIRFields', fragmentName, () => {
      let item = this.fragmentIRs.get(fragmentName)

      // This means the fragment has not yet been created.
      /* v8 ignore start -- @preserve */
      if (!item) {
        // Generate the actual fragment IR.
        // If successful, this will store the IR of the fragment.
        this.generateFragmentType(fragmentName)
        item = this.fragmentIRs.get(fragmentName)
      }
      /* v8 ignore stop */

      /* v8 ignore start -- @preserve */
      if (!item) {
        // Fragments that spread themselves already throw a
        // FragmentCycleError, so this is a bug.
        throw new LogicError(
          `Failed to generate IR for fragment: "${fragmentName}".`,
          this.getErrorContext(),
        )
      }
      /* v8 ignore stop */

      // The fields come from the file of the fragment and of the fragments it
      // spreads, so the cached result is purged when one of them changes.
      this.dependencyTracker?.merge(item)
      return item.map
    })
  }

  /**
   * Get the fields that a fragment selects on the type in which it's spread.
   *
   * A fragment on an abstract type can select different fields for each of
   * its types. Spread in an object, only the fields for that object type
   * apply.
   *
   * @param fragmentName - The name of the fragment.
   * @param parentTypeName - The name of the type in which it's spread.
   *
   * @returns The map, where the key is the name of the field and the value is the IR node.
   */
  private getFragmentIRFieldsForType(
    fragmentName: string,
    parentTypeName: string,
  ): Record<string, IRNode> {
    const fragment = this.getFragmentNode(fragmentName)
    const parentType = this.schema.getType(parentTypeName)
    if (
      !isObjectType(parentType) ||
      fragment.typeCondition.name.value === parentTypeName
    ) {
      return this.getFragmentIRFields(fragmentName)
    }

    return this.withCache(
      'getFragmentIRFieldsForType',
      fragmentName + ' ' + parentTypeName,
      () => {
        // The fields come from the file of the fragment and of the fragments
        // it spreads, so the cached result is purged when one of them changes.
        const item = this.fragmentIRs.get(fragmentName)
        if (item) {
          this.dependencyTracker?.merge(item)
        }
        const ir = this.postProcessIR(
          this.buildObjectSelectionSet(parentType, fragment.selectionSet),
        )
        return ir.kind === 'OBJECT' ? ir.fields : {}
      },
    )
  }

  /**
   * Get the fields that a fragment selects on a type, with the fields of the
   * fragments it spreads in place of these spreads.
   *
   * @param fragmentName - The name of the fragment.
   * @param parentTypeName - The name of the type in which it's spread.
   *
   * @returns The map, where the key is the name of the field and the value is the IR node.
   */
  private getFragmentFieldsWithNested(
    fragmentName: string,
    parentTypeName: string,
  ): Record<string, IRNode> {
    const fields = this.getFragmentIRFieldsForType(fragmentName, parentTypeName)
    let hasNestedSpread = false
    for (const key in fields) {
      if (fields[key]!.kind === 'FRAGMENT_SPREAD') {
        hasNestedSpread = true
        break
      }
    }
    if (!hasNestedSpread) {
      return fields
    }

    return this.withCache(
      'getFragmentFieldsWithNested',
      fragmentName + ' ' + parentTypeName,
      () => {
        // Read again, so that the cached result depends on the fragment.
        const fragmentFields = this.getFragmentIRFieldsForType(
          fragmentName,
          parentTypeName,
        )
        const result: Record<string, IRNode> = {}
        const nestedSpreads: IRNodeFragmentSpread[] = []
        for (const [key, field] of Object.entries(fragmentFields)) {
          if (field.kind === 'FRAGMENT_SPREAD') {
            nestedSpreads.push(field)
          } else {
            result[key] = field
          }
        }

        // The fields of a conditional spread may be missing.
        for (const spread of nestedSpreads) {
          mergeObjectFields(
            result,
            this.getFragmentFieldsWithNested(spread.name, parentTypeName),
            false,
            !!spread.optional,
          )
        }
        return result
      },
    )
  }

  /**
   * Whether a fragment selects anything on the given type.
   *
   * A fragment on an abstract type may only select fields for some of its
   * types. For the others, the fragment type is an empty object.
   *
   * @param fragmentName - The name of the fragment.
   * @param typeName - The name of the type in which it's spread.
   *
   * @returns False if the type is an object type on which the fragment selects nothing.
   */
  private fragmentSelectsFields(
    fragmentName: string,
    typeName: string,
  ): boolean {
    return this.withCache(
      'fragmentSelectsFields',
      fragmentName + ' ' + typeName,
      () => {
        if (!isObjectType(this.schema.getType(typeName))) {
          return true
        }

        // A field that all types of the fragment select.
        const isSelectedByAll = Object.values(
          this.getFragmentIRFields(fragmentName),
        ).some((field) => field.kind !== 'FRAGMENT_SPREAD' && !field.optional)
        if (isSelectedByAll) {
          return true
        }

        const fields = this.getFragmentIRFieldsForType(fragmentName, typeName)
        return Object.values(fields).some(
          (field) =>
            field.kind !== 'FRAGMENT_SPREAD' ||
            this.fragmentSelectsFields(field.name, typeName),
        )
      },
    )
  }

  /**
   * Build the IR of the selection set of an object type.
   *
   * @param objectType - The object type.
   * @param selectionSet - The selection set node.
   * @param forceTypename - Whether to add a __typename field. Defaults to the nonOptionalTypename option.
   *
   * @returns The IR for the selections.
   *
   * @throws {@link FieldNotFoundError} When a selected field does not exist on the type.
   * @throws {@link TypeNotFoundError} When a type could not be found.
   */
  private buildObjectSelectionSet(
    objectType: GraphQLObjectType,
    selectionSet: SelectionSetNode,
    forceTypename = this.options.output.nonOptionalTypename,
  ): IRNode {
    const fields: Record<string, IRNode> = {}
    let hasTypenameFromSpread = false
    let directFieldCount = 0

    for (const sel of selectionSet.selections) {
      if (sel.kind === Kind.FIELD) {
        if (sel.name.value === TYPENAME) {
          // The user explicitly requests __typename for this object type
          // => we know exactly what that string is
          const alias = sel.alias?.value || TYPENAME
          const typename: IRNodeTypename = {
            ...IR.TYPENAME(this.getOrCreateObjectTypeName(objectType)),
            optional: hasConditionalDirective(sel),
          }
          const current = fields[alias]
          fields[alias] = current ? mergeIR(current, typename) : typename
          directFieldCount++
          // Continue since __typename is not a field that exists.
          continue
        }

        const alias = sel.alias?.value || sel.name.value
        const fieldDef = this.schema.getFieldDef(objectType, sel.name.value)
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
        directFieldCount++
      }
    }

    for (const sel of selectionSet.selections) {
      if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragName = sel.name.value
        const fragDef = this.getFragmentNode(fragName)
        const fragmentFields = this.getFragmentIRFieldsForType(
          fragName,
          objectType.name,
        )
        // The __typename of a conditional spread is not moved to the parent
        // object, because it may be missing.
        const isConditional = hasConditionalDirective(sel)

        // If the fragment selects __typename, the parent object also gets one,
        // with the exact type of the object. In the intersection with the
        // fragment type, it selects the fragment's branch for this type. A
        // conditional spread or __typename doesn't add it, because it may be
        // missing.
        if (
          hasRequiredTypenameField(fragmentFields) &&
          !isConditional &&
          !hasTypenameField(fields)
        ) {
          hasTypenameFromSpread = true
        }

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
              optional: isConditional,
            }),
          )
        }
      } else if (sel.kind === Kind.INLINE_FRAGMENT) {
        const typeConditionName = getInlineFragmentTypeName(
          sel,
          objectType.name,
        )
        const isConditional = hasConditionalDirective(sel)

        // Only process inline fragment if it applies to this object type
        // (same type or object implements the interface/union)
        if (
          typeConditionName !== objectType.name &&
          !this.schema.objectImplements(objectType.name, typeConditionName)
        ) {
          continue
        }

        const spreadType = this.schema.getType(typeConditionName)
        const ir = this.buildSelectionSet(spreadType, sel.selectionSet, true)
        if (ir.kind === 'OBJECT') {
          mergeObjectFields(fields, ir.fields, false, isConditional)
        } else if (ir.kind === 'UNION') {
          // Find the branch matching this object type (not the type condition)
          for (const branch of ir.types) {
            if (
              branch.kind === 'OBJECT' &&
              branch.graphQLTypeName === objectType.name
            ) {
              mergeObjectFields(fields, branch.fields, false, isConditional)
            }
          }
        }
      }
    }

    const typenameField = fields[TYPENAME]
    if (forceTypename) {
      // Always add __typename field if option is set. It may already be there
      // as an optional field, from a conditional selection.
      if (!typenameField || typenameField.optional) {
        fields[TYPENAME] = IR.TYPENAME(
          this.getOrCreateObjectTypeName(objectType),
        )
      }
    } else if (
      !typenameField &&
      hasTypenameFromSpread &&
      directFieldCount >= 1
    ) {
      // Add a typename field if a fragment spread has one *and* if we have at least one direct field selection.
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
   * Build the IR for an object that only spreads the given fragments.
   *
   * @param abstractType - The type in which the fragments are spread.
   * @param fragments - The fragment definitions.
   * @param typeNames - The possible types to which the fragments apply.
   *
   * @returns The IR node.
   */
  private buildFragmentsIntersection(
    abstractType: GraphQLAbstractType,
    fragments: FragmentDefinitionNode[],
    typeNames: string[],
  ): IRNode {
    if (fragments.length === 0) {
      return this.emptyObjectScalar()
    } else if (fragments.length === 1) {
      const fragment = fragments[0]!
      const fragmentTypeName = this.generateFragmentType(fragment.name.value)
      return IR.SCALAR({
        tsType:
          typeNames.length === 1
            ? this.getSpreadTypeName(
                IR.FRAGMENT_SPREAD({
                  name: fragment.name.value,
                  fragmentTypeName,
                  parentType: typeNames[0]!,
                  fragmentTypeCondition: fragment.typeCondition.name.value,
                }),
              )
            : fragmentTypeName,
      })
    }

    // The fields are merged when the IR is converted to code, which also
    // handles conflicts between the fragments. If the fragments only apply to
    // a single type, only their fields for this type are merged.
    const parentTypeName =
      typeNames.length === 1 ? typeNames[0]! : abstractType.name
    const fields: Record<string, IRNode> = {}
    for (const fragment of fragments) {
      mergeFragmentSpread(
        fields,
        IR.FRAGMENT_SPREAD({
          name: fragment.name.value,
          fragmentTypeName: this.generateFragmentType(fragment.name.value),
          parentType: parentTypeName,
          fragmentTypeCondition: fragment.typeCondition.name.value,
        }),
      )
    }
    return IR.OBJECT({ graphQLTypeName: parentTypeName, fields })
  }

  /**
   * Get the TS type of a fragment spread.
   *
   * A fragment on an abstract type can be a union of the fields for each of
   * its types. Spread in an object, only the fields for the type of the object
   * apply, so the subtype of the fragment for that type is used.
   *
   * @param spread - The fragment spread.
   *
   * @returns The name of the TS type.
   */
  private getSpreadTypeName(spread: IRNodeFragmentSpread): string {
    // Most fragments are spread on their own type.
    if (spread.fragmentTypeCondition === spread.parentType) {
      return spread.fragmentTypeName
    }
    const parentType = this.schema.getType(spread.parentType)
    if (
      !isObjectType(parentType) ||
      !this.isTypeSpecificFragment(spread.name)
    ) {
      return spread.fragmentTypeName
    }
    // The fragment selects nothing on the type.
    if (!this.fragmentSelectsFields(spread.name, parentType.name)) {
      return this.options.output.emptyObject
    }
    return this.getOrCreateFragmentSubtype(spread.name, parentType)
  }

  /**
   * Whether the fields that a fragment selects depend on the object type.
   *
   * That's the case if it has an inline fragment or a fragment spread on
   * another type, also through the fragments on its own type that it spreads.
   * A __typename doesn't count: The object it's spread in has its own
   * __typename, which narrows it.
   *
   * @param fragmentName - The name of the fragment.
   *
   * @returns True if the fields depend on the object type.
   */
  private isTypeSpecificFragment(fragmentName: string): boolean {
    return this.withCache('isTypeSpecificFragment', fragmentName, () => {
      const fragment = this.getFragmentNode(fragmentName)
      const typeConditionName = fragment.typeCondition.name.value
      const check = (selectionSet: SelectionSetNode): boolean =>
        selectionSet.selections.some((sel) => {
          if (sel.kind === Kind.FIELD) {
            return false
          } else if (sel.kind === Kind.INLINE_FRAGMENT) {
            return (
              (sel.typeCondition?.name.value ?? typeConditionName) !==
                typeConditionName || check(sel.selectionSet)
            )
          }
          const spread = this.getFragmentNode(sel.name.value)
          return (
            spread.typeCondition.name.value !== typeConditionName ||
            this.isTypeSpecificFragment(sel.name.value)
          )
        })
      return check(fragment.selectionSet)
    })
  }

  /**
   * Generate the subtype of a fragment on an abstract type, with the fields it
   * selects on one of its object types.
   *
   * @param fragmentName - The name of the fragment.
   * @param objectType - The object type.
   *
   * @returns The name of the TS type.
   */
  private getOrCreateFragmentSubtype(
    fragmentName: string,
    objectType: GraphQLObjectType,
  ): string {
    const item = this.fragments.get(fragmentName)!
    return this.generateCodeOnce(
      'fragment-subtype',
      fragmentName + '-fragment-on-' + objectType.name,
      () => {
        const typeName =
          this.options.buildFragmentTypeName(item.node) +
          'On' +
          pascalCase(objectType.name)
        const fields = this.getFragmentIRFieldsForType(
          fragmentName,
          objectType.name,
        )
        return {
          code: makeExport(
            typeName,
            this.IRToCode(
              IR.OBJECT({ graphQLTypeName: objectType.name, fields }),
            ),
          ),
          typeName,
          context: { filePath: item.filePath, definition: item.node },
          source: null,
          graphqlName: fragmentName,
          identifier: 'type',
        }
      },
      item.filePath,
    )
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
   * Preprocesses a selection set to hoist fragment spreads that target
   * the same type as their parent inline fragment.
   *
   * This removes "useless" fragment spreads inside inline fragment spreads
   * that target the exact same type. An inline fragment on the parent type
   * without directives is replaced by its selections.
   *
   * @param selections - The selections to process
   * @param parentTypeName - The name of the type the selections are on, if known.
   * @returns An array of processed selections with hoisted fragment spreads
   */
  private preprocessSelections(
    selections: readonly SelectionNode[],
    parentTypeName?: string,
  ): SelectionNode[] {
    const result: SelectionNode[] = []
    const fragmentsToHoist: SelectionNode[] = []

    for (const sel of selections) {
      // An inline fragment without a type condition applies to the parent type.
      // When recursing into fields the parent type is unknown. Such inline
      // fragments are kept as they are: abstract fields preprocess their own
      // selections when they are built, and object fields don't need hoisting.
      const typeConditionName =
        sel.kind === Kind.INLINE_FRAGMENT
          ? (sel.typeCondition?.name.value ?? parentTypeName)
          : undefined

      if (sel.kind === Kind.INLINE_FRAGMENT && typeConditionName) {
        // Check if this inline fragment contains fragment spreads that target the same type.
        const [fragmentsToHoistFromInline, otherSelections] =
          this.separateFragmentSpreadsByTypeCondition(
            sel.selectionSet.selections,
            typeConditionName,
          )

        // A hoisted spread keeps the condition of the inline fragment.
        const conditionalDirectives = getConditionalDirectives(sel)
        for (const spread of fragmentsToHoistFromInline) {
          fragmentsToHoist.push(
            conditionalDirectives.length
              ? {
                  ...spread,
                  directives: [
                    ...conditionalDirectives,
                    ...(spread.directives ?? []),
                  ],
                }
              : spread,
          )
        }

        // If there are still other selections, keep the inline fragment with them.
        if (otherSelections.length > 0) {
          const processedInnerSelections = this.preprocessSelections(
            otherSelections,
            typeConditionName,
          )
          if (typeConditionName === parentTypeName && !sel.directives?.length) {
            // On the parent type and without directives, the inline fragment
            // only groups its selections: They are the same as selections on
            // the parent. As such, a __typename gets the type of each branch.
            result.push(...processedInnerSelections)
          } else if (processedInnerSelections.length > 0) {
            result.push({
              ...sel,
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: processedInnerSelections,
              },
            })
          }
        }
      } else if (sel.kind === Kind.FIELD && sel.selectionSet) {
        result.push({
          ...sel,
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: this.preprocessSelections(sel.selectionSet.selections),
          },
        })
      } else {
        result.push(sel)
      }
    }

    return [...fragmentsToHoist, ...result]
  }

  /**
   * Separates fragment spreads that target a specific type from other selections.
   *
   * @param selections - The selections to process
   * @param targetType - The type to match against fragment type conditions
   * @returns A tuple with [fragmentSpreadsMatchingType, otherSelections]
   */
  private separateFragmentSpreadsByTypeCondition(
    selections: readonly SelectionNode[],
    targetType: string,
  ): [FragmentSpreadNode[], SelectionNode[]] {
    const matchingFragments: FragmentSpreadNode[] = []
    const otherSelections: SelectionNode[] = []

    for (const sel of selections) {
      if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragDef = this.getFragmentNode(sel.name.value)
        const fragTypeCondition = fragDef.typeCondition.name.value

        if (fragTypeCondition === targetType) {
          // This fragment spread targets the same type as the parent inline fragment
          matchingFragments.push(sel)
          continue
        }
      }

      otherSelections.push(sel)
    }

    return [matchingFragments, otherSelections]
  }

  /**
   * Generate the IR selection set for an abstract (interface, union) type.
   *
   * @param abstractType - The interface/union type.
   * @param selectionSet - The selection set node.
   * @param withBranches - Always return an object node for each possible type, without using the shortcuts.
   *
   * @returns The IR node for the selection.
   *
   * @throws {@link FieldNotFoundError} When a field was selected that does not exist.
   * @throws {@link TypeNotFoundError} When a type does not exist.
   */
  private buildAbstractSelectionSet(
    abstractType: GraphQLAbstractType,
    selectionSet: SelectionSetNode,
    withBranches = false,
  ): IRNode {
    const selections = this.preprocessSelections(
      selectionSet.selections,
      abstractType.name,
    )

    const abstractTypeFields = isInterfaceType(abstractType)
      ? abstractType.getFields()
      : {}

    // Possible types that implement the interface/union.
    const possibleTypes = this.schema.getPossibleObjectTypeNames(
      abstractType.name,
    )

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
          // It may already be there because of the nonOptionalTypename option,
          // or because it is selected more than once.
          const typename: IRNodeTypename = {
            ...IR.TYPENAME(this.getOrCreateUnionTypenameType(abstractType)),
            optional: hasConditionalDirective(sel),
          }
          const current = baseFields[aliasName]
          baseFields[aliasName] = current
            ? mergeIR(current, typename)
            : typename
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
        const typeConditionName = getInlineFragmentTypeName(
          sel,
          abstractType.name,
        )
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

    // The shortcuts don't handle conditional fragment spreads and inline
    // fragments, so they are only used without them.
    const useShortcuts =
      !withBranches &&
      !selections.some(
        (sel) => sel.kind !== Kind.FIELD && hasConditionalDirective(sel),
      )

    // ====================================================================
    // Shortcuts for common use cases.
    //
    // This section is very verbose, because we try to find common
    // combinations of selections for which we can return an IR node
    // directly, without the overhead of generating a union branch for every
    // implementing type.
    // ====================================================================

    // We don't have any base fields.
    if (!hasBaseFields && useShortcuts) {
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
        // Group the possible types by the fragments that apply to them. A
        // type condition can be an abstract type, which applies to several
        // possible types, so a type can have the fields of several fragments.
        const groups = new Map<
          string,
          { fragments: FragmentDefinitionNode[]; typeNames: string[] }
        >()
        for (const possibleTypeName of possibleTypes) {
          let fragments = concreteFragmentTypes.flatMap((typeName) =>
            possibleTypeName === typeName ||
            this.schema.objectImplements(possibleTypeName, typeName)
              ? fragmentsByConcreteType[typeName]!
              : [],
          )
          // In an intersection, a fragment that selects nothing on the type is
          // left out.
          if (fragments.length > 1) {
            fragments = fragments.filter((fragment) =>
              this.fragmentSelectsFields(fragment.name.value, possibleTypeName),
            )
          }
          const key = fragments.map((v) => v.name.value).join(' ')
          const group = groups.get(key) ?? { fragments, typeNames: [] }
          group.typeNames.push(possibleTypeName)
          groups.set(key, group)
        }

        // Each group is the intersection of its fragments. A group without
        // fragments is an empty object.
        const unionTypes = [...groups.values()].map((group) =>
          this.buildFragmentsIntersection(
            abstractType,
            group.fragments,
            group.typeNames,
          ),
        )
        if (unionTypes.length > 1) {
          return IR.UNION({ types: unionTypes })
        }
        return unionTypes[0] ?? this.emptyObjectScalar()
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
        const typeConditionName = getInlineFragmentTypeName(
          sel,
          abstractType.name,
        )

        const spreadType = this.schema.getType(typeConditionName)
        const isConditional = hasConditionalDirective(sel)

        // Build the IR node for the selection for this object type.
        const ir = this.buildSelectionSet(spreadType, sel.selectionSet, true)

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
                false,
                isConditional,
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
                    false,
                    isConditional,
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
        const isConditional = hasConditionalDirective(sel)

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
              parentType: typeConditionType.name,
              fragmentTypeCondition: fragment.typeCondition.name.value,
              optional: isConditional,
            }),
          )
          objectTypeMap.set(typeConditionType.name, existing)
        } else if (isAbstractType(typeConditionType)) {
          const ir = this.buildSelectionSet(
            typeConditionType,
            fragment.selectionSet,
            true,
          )

          if (ir.kind === 'OBJECT') {
            const merged = mergeObjectFields(
              objectTypeMap.get(ir.graphQLTypeName) || {},
              ir.fields,
              false,
              isConditional,
            )
            objectTypeMap.set(ir.graphQLTypeName, merged)
          } else if (ir.kind === 'UNION') {
            for (const branch of ir.types) {
              if (branch.kind === 'OBJECT') {
                const merged = mergeObjectFields(
                  objectTypeMap.get(branch.graphQLTypeName) || {},
                  branch.fields,
                  false,
                  isConditional,
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
    // The keys of the __typename selections on the abstract type: __typename
    // and its aliases.
    const typenameKeys = Object.keys(baseFields).filter(
      (key) => baseFields[key]!.kind === 'TYPENAME',
    )
    let unionIrNode: IRNodeTypename | null = null
    // The __typename of the types without fragments, the same for each.
    let withoutFragmentsIrNode: IRNodeTypename | null = null

    for (const objectTypeName of possibleTypes) {
      // Clone the base fields.
      const mergedFields = { ...baseFields }

      // If user had an inline fragment for the type, merge those fields.
      const subtypeFields = objectTypeMap.get(objectTypeName)
      if (subtypeFields) {
        mergeObjectFields(mergedFields, subtypeFields)
      }

      // The __typename of this branch, if it differs from the one of the
      // abstract type.
      let branchTypename: IRNodeTypename | null = null

      if (typenameKeys.length) {
        if (
          typesWithFragments.has(objectTypeName) ||
          !this.options.output.mergeTypenames
        ) {
          // If this type has fragments, its __typename should be the name of the object type.
          branchTypename = IR.TYPENAME(
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

          withoutFragmentsIrNode ??= IR.TYPENAME(
            typesWithoutFragments.map((name) =>
              this.getOrCreateObjectTypeName(name),
            ),
          )
          branchTypename = unionIrNode ?? withoutFragmentsIrNode
        }
      }

      if (branchTypename) {
        for (const key of typenameKeys) {
          // A conditional __typename may be missing, unless an inline
          // fragment for this type also selects it.
          mergedFields[key] = mergedFields[key]!.optional
            ? { ...branchTypename, optional: true }
            : branchTypename
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
    allSpreads: IRNodeFragmentSpread[],
  ): string {
    // A single spread without other fields is not an intersection, so the
    // fragment type is used as is.
    if (allSpreads.length === 1 && fields.size === 0) {
      return this.IRToCode(allSpreads[0]!)
    }

    // A fragment that selects nothing on the type is an empty object, which
    // is left out of the intersection. With an empty object type such as
    // Record<string, never>, the intersection would have no valid value.
    const spreads = allSpreads.filter((spread) =>
      this.fragmentSelectsFields(spread.name, spread.parentType),
    )

    // No fragment spreads.
    if (spreads.length === 0) {
      return this.fieldMapToCode(fields)
    }

    if (spreads.length === 1 && fields.size === 0) {
      return this.IRToCode(spreads[0]!)
    }

    this.incrementDebugCount('mergeFragmentSpreads')

    // Map of all fields keyed by name of fragment.
    const fragmentFieldMaps: Record<string, Record<string, IRNode>> = {}

    for (const spread of spreads) {
      // A field can also come from a fragment that the fragment spreads.
      const fragmentFields = this.getFragmentFieldsWithNested(
        spread.name,
        spread.parentType,
      )
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
      let hasConditionalSpread = false

      // Add direct field if it exists
      const directField = fields.get(fieldName)
      if (directField) {
        nodes.push(directField)
      }

      // Add fields from fragments
      for (const spread of spreads) {
        const node = fragmentFieldMaps[spread.fragmentTypeName]?.[fieldName]
        if (node) {
          // The fields of a conditional spread may be missing.
          nodes.push(spread.optional ? { ...node, optional: true } : node)
          hasConditionalSpread ||= !!spread.optional
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

      // A conditional spread is emitted as Partial<>, which only makes its
      // own fields optional. When another selection also selects the field,
      // an intersection would make the nested fields of the spread required.
      // So the merged field is used, where these are optional.
      if (hasConditionalSpread && hasNestedSelections(merged)) {
        conflictFound = true
      }

      if (
        conflictFound &&
        !conflictFields.has(fieldName) &&
        fieldName !== TYPENAME
      ) {
        conflictFields.set(fieldName, merged)
      }
    }

    // A conditional __typename is merged like any other field.
    const hasOnlyTypename =
      !!fields.get(TYPENAME) &&
      !fields.get(TYPENAME)!.optional &&
      fields.size === 1
    const hasConflicts = !!conflictFields.size

    // Only __typename and fragment spreads: All spreads apply to the type of
    // this object, so it's the intersection of the fragments, with the
    // __typename of this object. It's left out if a fragment has it already.
    if (hasOnlyTypename && spreads.length > 0 && !hasConflicts) {
      const typenameNode = fields.get(TYPENAME) as IRNodeTypename
      const parts = spreads.map((spread) => this.IRToCode(spread))
      const hasTypenameFromSpread = spreads.some(
        (spread) =>
          !spread.optional &&
          hasRequiredTypenameField(
            this.getFragmentIRFieldsForType(spread.name, spread.parentType),
          ),
      )
      if (!hasTypenameFromSpread) {
        parts.push(`{ __typename: ${this.IRToCode(typenameNode)} }`)
      }
      return parts.length > 1 ? `(${parts.join(' & ')})` : parts[0]!
    }

    // When there are no conflicts found: Return a simple intersection.
    if (conflictFields.size === 0) {
      const codeFields = this.fieldMapToCode(fields)
      return [codeFields, ...spreads.map((spread) => this.IRToCode(spread))]
        .filter((v) => v !== this.options.output.emptyObject)
        .join(' & ')
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
      const fragmentFields = fragmentFieldMaps[spread.fragmentTypeName]!
      const allFragmentFieldNames = Object.keys(fragmentFields)

      // If there's a conflict field that the fragment actually defines, use Omit.
      const conflictsForThisFrag = [...conflictFields.keys()].filter((fld) => {
        return fragmentFields[fld] !== undefined
      })

      // Skip fragment entirely if all of its fields are conflicting.
      if (conflictsForThisFrag.length === allFragmentFieldNames.length) {
        continue
      }

      // Start with the fragment name.
      let replacedType = this.getSpreadTypeName(spread)

      // Apply Omit for conflicting fields. If the fragment type may be a union,
      // a distributive Omit is needed to keep the fields of all types.
      if (conflictsForThisFrag.length > 0) {
        const omitFields = conflictsForThisFrag.map((f) => `"${f}"`).join(' | ')
        const omit =
          replacedType !== spread.fragmentTypeName ||
          this.isObjectFragment(spread.name)
            ? 'Omit'
            : this.getOrCreateTypeHelper('distributiveOmit')
        replacedType = `${omit}<${replacedType}, ${omitFields}>`
      }

      // The fields of a conditional spread may be missing.
      if (spread.optional) {
        replacedType = `Partial<${replacedType}>`
      }

      intersectionParts.push(replacedType)
    }

    // Add merged conflict fields as a separate object into the intersection.
    // We know conflictFields.size > 0 here (otherwise we returned early above),
    // so intersectionParts will always have at least one element.
    intersectionParts.unshift(this.fieldMapToCode(conflictFields))

    if (intersectionParts.length === 1) {
      return intersectionParts[0]!
    }

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
    } else if (isObjectType(type) || isAbstractType(type)) {
      // Object and abstract types always require a selection set in valid GraphQL
      return this.buildSelectionSet(type, selectionSet!)
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
        return typenameToCode(ir)
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
        // Branches can generate the same code, for example when a fragment
        // that selects nothing is left out.
        const parts = [...new Set(ir.types.map((t) => this.IRToCode(t)))].sort()
        if (parts.length === 1) {
          return parts[0]!
        }
        return `(${parts.join(' | ')})`
      }

      case 'FRAGMENT_SPREAD': {
        // Merges as an intersection into the parent's object. The fields of a
        // conditional spread may be missing.
        const typeName = this.getSpreadTypeName(ir)
        return ir.optional ? `Partial<${typeName}>` : typeName
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
   * Anonymous operations are skipped, because the generated types are named
   * after the operation.
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
   * Check whether an input document with the given file path exists.
   *
   * @param filePath - The file path to check.
   *
   * @returns True if a document with this file path exists.
   */
  public hasFilePath(filePath: string): boolean {
    return this.inputDocuments.has(filePath)
  }

  /**
   * Update on or more documents.
   *
   * Without dependency tracking, all generated code is removed, so the next
   * build is a full build.
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

      this.logDebug('update - purgeFilePath: ' + doc.filePath)
      this.purgeFilePath(doc.filePath)
    }

    return this.add(docs)
  }

  /**
   * Removes all generated code originating from the given file path.
   *
   * Without dependency tracking, all generated code is removed, so the next
   * build is a full build.
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
    this.fragmentStack = []
    this.untrackedFragmentDependencies.clear()
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
   * Record the file of a definition name, and throw if it was already
   * recorded.
   *
   * @param files - The file path of each name seen so far.
   * @param kind - The kind of the definition.
   * @param name - The name of the definition.
   * @param input - The input document of the definition.
   *
   * @throws {@link DuplicateDefinitionError} if the name was already recorded.
   */
  private assertUniqueName(
    files: Map<string, string>,
    kind: 'fragment' | 'operation',
    name: string,
    input: GeneratorInput,
  ): void {
    const existing = files.get(name)
    if (existing !== undefined) {
      throw new DuplicateDefinitionError(kind, name, [existing, input.filePath])
    }
    files.set(name, input.filePath)
  }

  /**
   * Describe where generated code comes from, for an error message, with the
   * option that builds its name.
   *
   * @param code - The generated code.
   *
   * @returns The description.
   */
  private describeCodeSource(code: GeneratedCode): string {
    const name = code.graphqlName || code.name
    switch (code.type) {
      case 'typename-object':
        return `the object type "${name}" (buildTypenameTypeName)`
      case 'typename-union':
        return isInterfaceType(this.schema.getType(name))
          ? `the interface "${name}" (buildTypenameTypeName)`
          : `the union "${name}" (buildTypenameTypeName)`
      case 'enum':
        return `the enum "${name}" (buildEnumTypeName)`
      case 'input':
        return `the input type "${name}" (buildInputTypeName)`
      case 'fragment':
        return `the fragment "${name}" (buildFragmentTypeName)`
      case 'fragment-subtype':
        return `the subtype "${code.name}" of the fragment "${name}" (buildFragmentTypeName)`
      case 'operation':
        return `the ${code.identifier} "${name}" (buildOperationTypeName)`
      case 'operation-variables': {
        const operation = [...this.operations.values()].find(
          (v) => v.variablesTypeName === code.name,
        )
        return operation
          ? `the variables of the ${operation.operationType} "${operation.graphqlName}" (buildOperationVariablesTypeName)`
          : `the variables "${code.name}" (buildOperationVariablesTypeName)`
      }
      default:
        return `the type helper "${code.name}"`
    }
  }

  /**
   * Throw if two generated types have the same name, or if a generated type
   * has the name of a TypeScript type that the output uses.
   *
   * Renaming one of them automatically would not be stable: The name would
   * change when the other one is removed.
   *
   * @param code - The generated code of the output.
   *
   * @throws {@link DuplicateIdentifierError} if two generated types have the same name.
   */
  private assertUniqueIdentifiers(code: GeneratedCode[]): void {
    const byName = new Map<string, GeneratedCode>()
    for (const item of code) {
      if (this.globalTypeNames.has(item.name)) {
        throw new DuplicateIdentifierError(item.name, [
          this.describeCodeSource(item),
          `the TypeScript type "${item.name}", which the output uses`,
        ])
      }
      const existing = byName.get(item.name)
      if (existing) {
        throw new DuplicateIdentifierError(item.name, [
          this.describeCodeSource(existing),
          this.describeCodeSource(item),
        ])
      }
      byName.set(item.name, item)
    }
  }

  /**
   * Get the generated code that is part of the output.
   *
   * With skipUnusedFragments, only the code that the operations use is
   * output. Code that was only used by a removed operation, such as a
   * fragment, stays in the state until its file changes.
   *
   * @returns The generated code.
   */
  private getUsedCode(): GeneratedCode[] {
    const code = [...this.generatedCode.values()]
    if (!this.options.skipUnusedFragments || !this.dependencyTracker) {
      return code
    }

    // The dependencies of an operation include the code it uses, also
    // through fragments.
    const used = new Set<string>()
    for (const operation of this.operations.values()) {
      for (const dependency of operation.dependencies) {
        used.add(dependency)
      }
    }
    return code.filter((item) => used.has(item.id))
  }

  /**
   * Build the output from the current state.
   *
   * If any error happens during the build phase, the entire state (excluding
   * input documents) is reset, so that the state stays consistent. Any error
   * is rethrown.
   *
   * Fragment and operation names must be unique across all input documents.
   * Anonymous operations are skipped, because the generated types are named
   * after the operation.
   *
   * @returns The generator output.
   *
   * @throws {@link DependencyTrackingError} if there is an inconsistent dependency tracker state after the build phase.
   * @throws {@link TypeNotFoundError} if a requested type could not be found.
   * @throws {@link FragmentNotFoundError} if no fragment definition exists for a fragment spread.
   * @throws {@link FieldNotFoundError} if a non-existing field was selected
   * @throws {@link MissingRootTypeError} if the root type is unsupported.
   * @throws {@link DuplicateDefinitionError} if a fragment or operation name is defined more than once.
   * @throws {@link FragmentCycleError} if a fragment spreads itself, directly or through other fragments.
   * @throws {@link DuplicateIdentifierError} if two generated types have the same name.
   * @throws {@link LogicError} if there is a logical error during building. This can hint at a bug in the Generator.
   */
  public build(): GeneratorOutput {
    // This cache is only needed for a single build execution to prevent recursion.
    // The cache is not dependency aware, because it only relies on data from the
    // schema. Therefore we can always clear it in every build run.
    this.generatedInputTypes.clear()

    try {
      // Fragment spreads are resolved across all input documents, and
      // operations are looked up by name. So both names must be unique across
      // all input documents. This is checked here and not in add(), because
      // moving a definition to another file can take more than one update().
      const fragmentFiles = new Map<string, string>()
      this.forEachDefinitionKind(Kind.FRAGMENT_DEFINITION, (node, input) => {
        this.assertUniqueName(fragmentFiles, 'fragment', node.name.value, input)
        this.dependencyTracker?.addFragment(node.name.value)
        this.fragments.set(node.name.value, {
          node,
          filePath: input.filePath,
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

      const operationFiles = new Map<string, string>()
      this.forEachDefinitionKind(Kind.OPERATION_DEFINITION, (def, input) => {
        if (def.name) {
          this.assertUniqueName(
            operationFiles,
            'operation',
            def.name.value,
            input,
          )
        }
        this.generateOperationType(def, input)
      })

      // Update fragment dependencies from fragmentIRs.
      for (const [fragmentName, fragment] of this.fragments) {
        const irData = this.fragmentIRs.get(fragmentName)
        if (irData) {
          fragment.dependencies = irData.dependencies
        }
      }

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
    // Code from additionalOutputCode() is not checked: Its name doesn't have
    // to be the name of what it defines.
    const code = this.getUsedCode()
    this.assertUniqueIdentifiers(code)

    return new GeneratorOutput(
      [...code, ...this.options.additionalOutputCode()],
      [...this.operations.values()],
      [...this.fragments.values()],
    )
  }
}
