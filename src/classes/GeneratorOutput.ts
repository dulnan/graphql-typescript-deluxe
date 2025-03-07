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
import { generateHeaderComment, graphqlToString } from '../helpers/string'
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

  /**
   * Returns all generated code items.
   *
   * @returns The generated code items.
   */
  public getGeneratedCode(): GeneratorOutputCode[] {
    return this.code
  }

  /**
   * Returns all collected operations.
   *
   * @returns All collected oeprations.
   */
  public getCollectedOperations(): GeneratorOutputOperation[] {
    return this.operations
  }

  /**
   * Generates the final string of all generated code for the given type.
   *
   * @param type - The generated code type.
   *
   * @returns The code as a single string or null if it would result in an empty string.
   */
  public buildCodeGroupString(type: GeneratedCodeType): string | null {
    const items = this.code.filter((v) => v.type === type)
    const code = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => v.code)
      .join(type === 'typename-object' ? '\n' : '\n\n')

    return code
      ? `${generateHeaderComment(getCodeTypeLabel(type))}\n\n${code}`.trim()
      : null
  }

  /**
   * Build a TypeScript file containing the given code types.
   *
   * @param types - The code types to include.
   * @param options - The options.
   *
   * @return The output file.
   */
  public buildFile(
    types: GeneratedCodeType[] = [],
    options?: GeneratorOutputOptions,
  ): GeneratorOutputFile {
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

      included.push(code.id)
    }

    const groupOrder = options?.sorting || DEFAULT_SORTING
    const groups = [...types].sort(
      (a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b),
    )

    const source = groups
      .map((type) => this.buildCodeGroupString(type))
      .filter(notNullish)
      .join('\n\n\n')
      .trim()

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
   * Builds the operations export file as a valid JS file.
   *
   * The file contains a single exported object named "operations", with properties for
   * every operation type, containing all operations keyed by operation name.
   *
   * If the provided input document nodes were parsed with `noLocation: true` a
   * NodeLocMissingError will be thrown, as the source code is not available to
   * generate the operations file.
   *
   * @param options The options.
   * @param options.minify Whether to minify the variable names.
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

    return new GeneratorOutputFile(source, [], 'js')
  }
}
