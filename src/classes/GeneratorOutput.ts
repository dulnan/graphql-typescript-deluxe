import { NodeLocMissingError, LogicError } from '../errors'
import { getCodeTypeLabel } from '../helpers/generator'
import { notNullish } from '../helpers/type'
import type {
  CollectedOperation,
  GeneratedCode,
  GeneratedCodeType,
} from '../types/index'
import { KEY_SEPARATOR } from './DependencyTracker'
import { stripIgnoredCharacters } from 'graphql'
import { MinifyVariableName } from './MinifyVariableName'

const DEFAULT_SORTING: GeneratedCodeType[] = [
  'helpers',
  'type-helpers',
  'enum',
  'typename-object',
  'typename-union',
  'fragment',
  'operation',
  'operation-variables',
  'input',
]

/**
 * Escapes any "`" in the string so that the string can be used in "`${str}`".
 */
function toValidString(str: string): string {
  return '`' + stripIgnoredCharacters(str).replaceAll('`', '\\`') + '`'
}

type MappedDependencyType = GeneratedCodeType | 'fragment-name'

type MappedDependency = {
  type: MappedDependencyType
  value: string
}

export type GeneratorOutputCode = Omit<GeneratedCode, 'dependencies'> & {
  dependencies: MappedDependency[]
}

export type GeneratorOutputOperation = Omit<
  CollectedOperation,
  'dependencies'
> & {
  dependencies: MappedDependency[]
}

export type GeneratorOutputOptions = {
  /**
   * How each block should be sorted.
   */
  sorting?: GeneratedCodeType[]
}

function mapDependencies(dependencies?: string[]): MappedDependency[] {
  if (!dependencies) {
    return []
  }
  return dependencies.map((dependency) => {
    const [type, value] = dependency.split(KEY_SEPARATOR)
    return {
      type: type as MappedDependencyType,
      value: value || '',
    }
  })
}

export class GeneratorOutput {
  private code: GeneratorOutputCode[]
  private operations: GeneratorOutputOperation[]

  constructor(codes: GeneratedCode[], operations: CollectedOperation[]) {
    this.code = codes.map((code) => {
      return {
        ...code,
        dependencies: mapDependencies(code.dependencies),
      }
    })
    this.operations = operations.map((operation) => {
      return {
        ...operation,
        dependencies: mapDependencies(operation.dependencies),
      }
    })
  }

  public getGeneratedCode(): GeneratorOutputCode[] {
    return this.code
  }

  public getCollectedOperations(): GeneratorOutputOperation[] {
    return this.operations
  }

  private buildOutputTypes(
    types: GeneratedCodeType[] = [],
    options?: GeneratorOutputOptions,
  ): string {
    const grouped = this.code.reduce<
      Partial<Record<GeneratedCodeType, GeneratorOutputCode[]>>
    >((acc, value) => {
      if (!types.includes(value.type)) {
        return acc
      }
      if (!acc[value.type]) {
        acc[value.type] = []
      }
      acc[value.type]!.push(value)
      return acc
    }, {})

    const sorting = options?.sorting || DEFAULT_SORTING

    return Object.entries(grouped)
      .sort(
        (a, b) => sorting.indexOf(a[0] as any) - sorting.indexOf(b[0] as any),
      )
      .map((group) => {
        const type = group[0] as GeneratedCodeType
        const join = type === 'typename-object' ? '\n' : '\n\n'
        const comment = [
          '// ' + '-'.repeat(80),
          '// ' + getCodeTypeLabel(type),
          '// ' + '-'.repeat(80),
        ].join('\n')

        const code = group[1]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((v) => v.code)
          .join(join)

        if (!code) {
          return null
        }

        return `${comment}\n\n${code}`
      })
      .filter(notNullish)
      .join('\n\n\n')
  }

  /**
   * Returns types only.
   */
  public getTypes(options?: GeneratorOutputOptions): string {
    const typesOnly = DEFAULT_SORTING.filter(
      (v) => v !== 'enum' && v !== 'helpers',
    )
    return this.buildOutputTypes(typesOnly, options)
  }

  /**
   * Get everything.
   *
   * @returns The file contents.
   */
  public getEverything(options?: GeneratorOutputOptions): string {
    return this.buildOutputTypes(DEFAULT_SORTING, options)
  }

  /**
   * Builds the operations export file.
   *
   * The file contains a single exported object named "operations", with properties for
   * every operation type, containing all operations keyed by operation name.
   *
   * If the provided input document nodes were parsed with `noLocation: true` a
   * NodeLocMissingError will be thrown, as the source code is not available to
   * generate the operations file.
   *
   * @returns The file contents.
   */
  public getOperationsFile(options?: { minify?: boolean }): string {
    const shouldMinify = options?.minify ?? true
    const declarations: { name: string; value: string }[] = []
    const query: string[] = []
    const mutation: string[] = []
    const subscription: string[] = []

    const variableMinifier = new MinifyVariableName(shouldMinify)

    for (const code of this.code) {
      if (code.type === 'fragment') {
        if (!notNullish(code.source)) {
          throw new NodeLocMissingError(code.graphqlName || code.name)
        }
        if (!code.graphqlName) {
          throw new LogicError('Missing graphqlName for fragment.')
        }
        const varName = variableMinifier.getVarName(code.graphqlName)
        declarations.push({ name: varName, value: code.source })
      } else if (code.type === 'operation') {
        if (!notNullish(code.source)) {
          throw new NodeLocMissingError(code.graphqlName || code.name)
        }

        const fragmentDependencies = code.dependencies
          .filter((v) => v.type === 'fragment-name')
          .map((v) => variableMinifier.getVarName(v.value))

        let parts = [toValidString(code.source), ...fragmentDependencies].join(
          ' + ',
        )
        if (parts.length > 80 && !shouldMinify) {
          parts = '\n      ' + parts.replaceAll(' + ', ' +\n      ')
        }
        const declaration = `'${code.graphqlName!}': ${parts},`
        if (code.identifier === 'query') {
          query.push(declaration)
        } else if (code.identifier === 'mutation') {
          mutation.push(declaration)
        } else if (code.identifier === 'subscription') {
          subscription.push(declaration)
        }
      }
    }

    const sortedDeclarations = declarations
      .sort((a, b) => a.value.localeCompare(b.value))
      .map((v) => `const ${v.name} = ${toValidString(v.value)};`)
      .join('\n')

    return `${sortedDeclarations}

export const operations = {
  query: {
    ${query.sort().join('\n    ')}
  },
  mutation: {
    ${mutation.sort().join('\n    ')}
  },
  subscription: {
    ${subscription.sort().join('\n    ')}
  }
}`
  }
}
