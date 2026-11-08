import {
  assertInputType,
  assertScalarType,
  executeSync,
  extendSchema,
  isAbstractType,
  isEnumType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isObjectType,
  Kind,
  parse,
  typeFromAST,
  TypeInfo,
  ValidationContext,
  visit,
  type DocumentNode,
  type ExecutionResult,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLInputField,
  type GraphQLInputType,
  type GraphQLOutputType,
  type GraphQLSchema,
  type OperationDefinitionNode,
} from 'graphql'
import type { GeneratorOutput } from '../../../../src/classes/GeneratorOutput'
import type { TypeOptions } from '../optionSets'

/**
 * How often a nullable field or input is null.
 */
const NULL_PROBABILITY = 0.25

/**
 * How often an execution without null fields is tried to reach a variable
 * that is null.
 */
const NULL_VARIABLE_TRIES = 40

/**
 * Whether the input field has a default value. graphql 17 has the default of
 * a schema from SDL in `default`, graphql 16 in `defaultValue`.
 */
function hasDefaultValue(field: GraphQLInputField): boolean {
  const { default: defaultInput, defaultValue } = field as {
    default?: unknown
    defaultValue?: unknown
  }
  return defaultInput !== undefined || defaultValue !== undefined
}

/**
 * Random values for the responses and variables of an operation. They are
 * seeded, so every run checks the same values.
 */
class RandomValues {
  private state: number
  private readonly schema: GraphQLSchema
  private readonly nullProbability: number

  constructor(schema: GraphQLSchema, seed: number, nullProbability: number) {
    this.schema = schema
    this.state = seed >>> 0
    this.nullProbability = nullProbability
  }

  /**
   * A number from 0 to 1 (mulberry32).
   */
  private next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  private pick<T>(values: readonly T[]): T {
    return values[Math.floor(this.next() * values.length)]!
  }

  private length(): number {
    return Math.floor(this.next() * 3)
  }

  private leaf(name: string): unknown {
    switch (name) {
      case 'Int':
        return 7
      case 'Float':
        return 1.5
      case 'Boolean':
        return this.next() < 0.5
      default:
        return 'string'
    }
  }

  /**
   * The value of a field, which the execution completes. An object is
   * resolved by its fields and an abstract type by `type`.
   */
  output(type: GraphQLOutputType): unknown {
    if (isNonNullType(type)) {
      return this.outputNonNull(type.ofType)
    }
    return this.next() < this.nullProbability ? null : this.outputNonNull(type)
  }

  private outputNonNull(type: GraphQLOutputType): unknown {
    if (isListType(type)) {
      return Array.from({ length: this.length() }, () =>
        this.output(type.ofType),
      )
    } else if (isAbstractType(type)) {
      const possibleTypes = this.schema.getPossibleTypes(type)
      return possibleTypes.length
        ? { type: this.pick(possibleTypes).name }
        : null
    } else if (isObjectType(type)) {
      return {}
    } else if (isEnumType(type)) {
      return this.pick(type.getValues()).name
    }
    return this.leaf(assertScalarType(type).name)
  }

  /**
   * The variables of an operation. Optional ones are left out at random.
   */
  variables(operation: OperationDefinitionNode): Record<string, unknown> {
    const variables: Record<string, unknown> = {}
    for (const definition of operation.variableDefinitions ?? []) {
      const type = assertInputType(typeFromAST(this.schema, definition.type))
      const optional = !isNonNullType(type) || !!definition.defaultValue
      if (optional && this.next() < 0.5) {
        continue
      }
      // An explicit null for a variable with a default is only rejected
      // where a non-null value is required.
      variables[definition.variable.name.value] =
        definition.defaultValue && !isNonNullType(type)
          ? this.next() < 0.3
            ? null
            : this.inputNonNull(type)
          : this.input(type)
    }
    return variables
  }

  private input(type: GraphQLInputType): unknown {
    if (isNonNullType(type)) {
      return this.inputNonNull(type.ofType)
    }
    return this.next() < 0.2 ? null : this.inputNonNull(type)
  }

  private inputNonNull(type: GraphQLInputType): unknown {
    if (isListType(type)) {
      return Array.from({ length: this.length() }, () =>
        this.input(type.ofType),
      )
    } else if (isInputObjectType(type)) {
      const fields = Object.values(type.getFields())
      if (type.isOneOf) {
        const field = this.pick(fields)
        const type = isNonNullType(field.type) ? field.type.ofType : field.type
        return { [field.name]: this.inputNonNull(type) }
      }
      const value: Record<string, unknown> = {}
      for (const field of fields) {
        const optional = !isNonNullType(field.type) || hasDefaultValue(field)
        if (!optional || this.next() >= 0.5) {
          value[field.name] = this.input(field.type)
        }
      }
      return value
    } else if (isEnumType(type)) {
      return this.pick(type.getValues()).name
    }
    return this.leaf(assertScalarType(type).name)
  }
}

/**
 * Add __typename to every selection set except the root of an operation, like
 * Apollo Client and urql do.
 */
function addTypenames(document: DocumentNode): DocumentNode {
  const typename: FieldNode = {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: '__typename' },
  }
  return visit(document, {
    SelectionSet(node, _key, parent) {
      const parentKind = parent && 'kind' in parent ? parent.kind : null
      const hasTypename = node.selections.some(
        (v) =>
          v.kind === Kind.FIELD &&
          v.name.value === '__typename' &&
          !v.alias &&
          !v.directives?.length,
      )
      if (parentKind === Kind.OPERATION_DEFINITION || hasTypename) {
        return undefined
      }
      return { ...node, selections: [...node.selections, typename] }
    },
  })
}

/**
 * Remove what the options assume the client removes: null fields for
 * nullableField "optional" and null array elements for nullableArrayElements
 * false.
 */
function shapeResponse(value: unknown, options: TypeOptions): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((v) => options.nullableArrayElements || v !== null)
      .map((v) => shapeResponse(v, options))
  } else if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => options.nullableField !== 'optional' || v !== null)
        .map(([key, v]) => [key, shapeResponse(v, options)]),
    )
  }
  return value
}

/**
 * Execute an operation with the random values.
 */
function executeWithValues(
  schema: GraphQLSchema,
  document: DocumentNode,
  operationName: string,
  variableValues: Record<string, unknown>,
  values: RandomValues,
): ExecutionResult {
  return executeSync({
    schema,
    document,
    operationName,
    rootValue: {},
    variableValues,
    fieldResolver: (_source, _args, _context, info) =>
      values.output(info.returnType),
    typeResolver: (value) => (value as { type: string }).type,
  })
}

type Checks = {
  /**
   * Assignments of real responses to the operation or fragment types.
   */
  responses: string[]

  /**
   * Assignments of the variables to the variables types. Variables that the
   * execution rejects must be rejected by the type.
   */
  variables: string[]

  /**
   * Execution errors that don't come from the variables.
   */
  errors: string[]
}

/**
 * Execute every operation of the output with random responses and variables
 * and build the code that assigns them to the generated types.
 *
 * @param schema - The schema.
 * @param document - The document with all operations and fragments.
 * @param output - The generated output.
 * @param options - The output options of the output.
 * @param samples - How many responses are created per operation.
 */
export function buildChecks(
  schema: GraphQLSchema,
  document: DocumentNode,
  output: GeneratorOutput,
  options: TypeOptions,
  samples: number,
): Checks {
  const executedDocument = options.nonOptionalTypename
    ? addTypenames(document)
    : document
  const checks: Checks = { responses: [], variables: [], errors: [] }

  for (const operation of output.getCollectedOperations()) {
    const execute = (
      variableValues: Record<string, unknown>,
      values: RandomValues,
    ): ExecutionResult =>
      executeWithValues(
        schema,
        executedDocument,
        operation.graphqlName,
        variableValues,
        values,
      )

    /**
     * Whether the execution rejects the null variables: It fails with them and
     * succeeds without them. A null variable is only rejected where the
     * execution reaches it, so responses without null fields are tried too.
     */
    const rejectsNullVariables = (
      variables: Record<string, unknown>,
      seed: number,
    ): boolean => {
      const withoutNull = Object.fromEntries(
        Object.entries(variables).filter(([, v]) => v !== null),
      )
      for (let j = 0; j <= NULL_VARIABLE_TRIES; j++) {
        const createValues = (): RandomValues =>
          j === 0
            ? new RandomValues(schema, seed, NULL_PROBABILITY)
            : new RandomValues(schema, seed * 31 + j, 0)
        if (execute(variables, createValues()).errors?.length) {
          return !execute(withoutNull, createValues()).errors?.length
        }
      }
      return false
    }

    const seen = new Set<string>()
    for (let i = 0; i < samples; i++) {
      const name = `${operation.graphqlName}_${i}`
      const seed = i * 7919 + operation.graphqlName.length
      const variables = new RandomValues(
        schema,
        seed,
        NULL_PROBABILITY,
      ).variables(operation.node)
      // On one line, so that the error is on the line after the directive.
      const variablesLiteral = JSON.stringify(variables)

      if (
        Object.values(variables).includes(null) &&
        rejectsNullVariables(variables, seed + 1)
      ) {
        if (!seen.has(variablesLiteral)) {
          seen.add(variablesLiteral)
          checks.variables.push(
            '// @ts-expect-error The execution rejects the null variable.',
            `export const ${name}: T.${operation.variablesTypeName} = ${variablesLiteral}`,
          )
        }
        continue
      }

      const result = execute(
        variables,
        new RandomValues(schema, seed + 1, NULL_PROBABILITY),
      )
      if (result.errors?.length) {
        checks.errors.push(
          ...result.errors.map((v) => `${operation.graphqlName}: ${v.message}`),
        )
        continue
      }

      const response = JSON.stringify(
        shapeResponse(result.data, options),
        null,
        2,
      )
      const key = response + variablesLiteral
      if (!seen.has(key)) {
        seen.add(key)
        checks.responses.push(
          `export const ${name}: T.${operation.typeName} = ${response}`,
        )
        checks.variables.push(
          `export const ${name}: T.${operation.variablesTypeName} = ${variablesLiteral}`,
        )
      }
    }
  }

  return checks
}

/**
 * Spread every fragment in a field of its type condition and build the code
 * that assigns the field's value to the fragment type. The fields are added to
 * the query type for the execution only.
 *
 * @param schema - The schema.
 * @param document - The document with all operations and fragments.
 * @param output - The generated output.
 * @param options - The output options of the output.
 * @param samples - How many values are created per fragment.
 */
export function buildFragmentChecks(
  schema: GraphQLSchema,
  document: DocumentNode,
  output: GeneratorOutput,
  options: TypeOptions,
  samples: number,
): Checks {
  const checks: Checks = { responses: [], variables: [], errors: [] }
  const queryType = schema.getQueryType()
  const fragments = document.definitions.filter(
    (v): v is FragmentDefinitionNode => v.kind === Kind.FRAGMENT_DEFINITION,
  )
  // The fields of introspection types resolve real types, not random values.
  // Operations check them through __schema and __type.
  const checkedFragments = fragments.filter(
    (v) => !v.typeCondition.name.value.startsWith('__'),
  )
  if (!queryType || !checkedFragments.length) {
    return checks
  }

  const typeNames = new Map(
    output
      .getGeneratedCode()
      .filter((v) => v.type === 'fragment')
      .map((v) => [v.graphqlName, v.name]),
  )
  const getFieldName = (typeName: string): string => `soundness${typeName}`
  const fields = [
    ...new Set(checkedFragments.map((v) => v.typeCondition.name.value)),
  ]
    .map((v) => `${getFieldName(v)}: ${v}!`)
    .join(' ')
  const extendedSchema = extendSchema(
    schema,
    parse(`extend type ${queryType.name} { ${fields} }`),
  )

  for (const fragment of checkedFragments) {
    const name = fragment.name.value
    const typeName = typeNames.get(name)
    if (!typeName) {
      checks.errors.push(`The fragment "${name}" has no type.`)
      continue
    }
    const fieldName = getFieldName(fragment.typeCondition.name.value)
    const buildOperation = (variables: string): OperationDefinitionNode =>
      parse(`query soundness${variables} { ${fieldName} { ...${name} } }`)
        .definitions[0] as OperationDefinitionNode

    // The variables that the fragment uses, typed by where they are used.
    const variableTypes = new Map<string, string>()
    const context = new ValidationContext(
      extendedSchema,
      { kind: Kind.DOCUMENT, definitions: fragments },
      new TypeInfo(extendedSchema),
      () => {},
    )
    for (const usage of context.getRecursiveVariableUsages(
      buildOperation(''),
    )) {
      const variableName = usage.node.name.value
      if (
        usage.type &&
        (!variableTypes.has(variableName) || isNonNullType(usage.type))
      ) {
        variableTypes.set(variableName, String(usage.type))
      }
    }
    const definitions = [...variableTypes]
      .map(([variableName, type]) => `$${variableName}: ${type}`)
      .join(', ')
    const operation = buildOperation(definitions ? `(${definitions})` : '')
    const fragmentDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [operation, ...fragments],
    }
    const executedDocument = options.nonOptionalTypename
      ? addTypenames(fragmentDocument)
      : fragmentDocument

    const seen = new Set<string>()
    for (let i = 0; i < samples; i++) {
      const seed = i * 7919 + name.length
      const variables = new RandomValues(
        extendedSchema,
        seed,
        NULL_PROBABILITY,
      ).variables(operation)
      const result = executeWithValues(
        extendedSchema,
        executedDocument,
        'soundness',
        variables,
        new RandomValues(extendedSchema, seed + 1, NULL_PROBABILITY),
      )
      if (result.errors?.length) {
        checks.errors.push(...result.errors.map((v) => `${name}: ${v.message}`))
        continue
      }
      const value = JSON.stringify(
        shapeResponse(result.data?.[fieldName], options),
        null,
        2,
      )
      if (!seen.has(value)) {
        seen.add(value)
        checks.responses.push(
          `export const fragment_${name}_${i}: T.${typeName} = ${value}`,
        )
      }
    }
  }

  return checks
}
