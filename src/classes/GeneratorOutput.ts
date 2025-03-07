import { NodeLocMissingError, LogicError } from '../errors'
import { getCodeTypeLabel } from '../helpers/generator'
import { notNullish } from '../helpers/type'
import type {
  CollectedOperation,
  GeneratedCode,
  GeneratedCodeType,
} from '../types/index'
import { MinifyVariableName } from './MinifyVariableName'
import { GeneratorOutputCode } from './GeneratorOutputCode'
import { GeneratorOutputOperation } from './GeneratorOutputOperation'
import { graphqlToString } from '../helpers/string'
import { GeneratorOutputFile } from './GeneratorOutputFile'

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

export type GeneratorOutputOptions = {
  /**
   * How each block should be sorted.
   */
  sorting?: GeneratedCodeType[]
}

export class GeneratorOutput {
  private code: GeneratorOutputCode[]
  private operations: GeneratorOutputOperation[]

  constructor(codes: GeneratedCode[], operations: CollectedOperation[]) {
    this.code = codes.map((v) => new GeneratorOutputCode(v))
    this.operations = operations.map((v) => new GeneratorOutputOperation(v))
  }

  public getGeneratedCode(): GeneratorOutputCode[] {
    return this.code
  }

  public getCollectedOperations(): GeneratorOutputOperation[] {
    return this.operations
  }

  /**
   * Build a file containing the given types.
   *
   * @param types - The types to include.
   * @param options - The options.
   *
   * @return The output file.
   */
  public buildFile(
    types: GeneratedCodeType[] = [],
    options?: GeneratorOutputOptions,
  ): GeneratorOutputFile {
    const grouped: Partial<Record<GeneratedCodeType, GeneratorOutputCode[]>> =
      {}

    // All collected dependencies of all code items.
    const allDependencies: Set<string> = new Set()

    // The IDs of code items that were included.
    const included: string[] = []

    for (const code of this.code) {
      const dependencies = code.dependencyStrings
      for (const key of dependencies) {
        allDependencies.add(key)
      }
      if (!types.includes(code.type)) {
        continue
      }
      if (!grouped[code.type]) {
        grouped[code.type] = []
      }

      grouped[code.type]!.push(code)
      included.push(code.id)
    }

    const sorting = options?.sorting || DEFAULT_SORTING

    const source = Object.entries(grouped)
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

    return new GeneratorOutputFile(
      source,
      [...allDependencies.values()].filter((id) => {
        return !included.includes(id)
      }),
    )
  }

  /**
   * Returns types only.
   *
   * This excludes code types that are potentially not type-only, such as enum consts or helpers.
   */
  public getTypes(options?: GeneratorOutputOptions): GeneratorOutputFile {
    const typesOnly = DEFAULT_SORTING.filter(
      (v) => v !== 'enum' && v !== 'helpers',
    )
    return this.buildFile(typesOnly, options)
  }

  /**
   * Returns non-types only.
   *
   * This incldues code types that are not type-only, such as enum consts or helpers.
   */
  public getNonTypes(options?: GeneratorOutputOptions): GeneratorOutputFile {
    return this.buildFile(['enum', 'helpers'], options)
  }

  /**
   * Get everything.
   *
   * @returns The file contents.
   */
  public getEverything(options?: GeneratorOutputOptions): GeneratorOutputFile {
    return this.buildFile(DEFAULT_SORTING, options)
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
  public getOperationsFile(options?: {
    minify?: boolean
  }): GeneratorOutputFile {
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

        const fragmentDependencies = code
          .getGraphQLFragmentDependencies()
          .map((v) => variableMinifier.getVarName(v))

        let parts = [
          graphqlToString(code.source),
          ...fragmentDependencies,
        ].join(' + ')
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
      .map((v) => `const ${v.name} = ${graphqlToString(v.value)};`)
      .join('\n')

    const source = `${sortedDeclarations}

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

    return new GeneratorOutputFile(source)
  }
}
