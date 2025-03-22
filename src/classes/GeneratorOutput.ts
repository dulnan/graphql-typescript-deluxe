import { getCodeTypeLabel } from '../helpers/generator'
import { notNullish } from '../helpers/type'
import type {
  CollectedOperation,
  GeneratedCode,
  GeneratedCodeOutputType,
  GeneratedCodeType,
} from '../types/index'
import { GeneratorOutputCode } from './GeneratorOutputCode'
import { GeneratorOutputOperation } from './GeneratorOutputOperation'
import { generateHeaderComment } from '../helpers/string'
import { GeneratorOutputFile } from './GeneratorOutputFile'
import {
  generateOperationsFile,
  type GenerateOperationsFileOptions,
} from '../helpers/output/generateOperationsFile'
import { generateOperationTypes } from '../helpers/output/generateOperationTypes'

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
  private readonly code: GeneratorOutputCode[]
  private readonly operations: GeneratorOutputOperation[]

  constructor(codes: GeneratedCode[], operations: CollectedOperation[]) {
    this.code = codes.map((v) => new GeneratorOutputCode(v))
    this.operations = operations.map((v) => new GeneratorOutputOperation(v))
  }

  /**
   * Returns all generated code items.
   *
   * @returns The generated code items.
   */
  public getGeneratedCode(): readonly GeneratorOutputCode[] {
    return this.code
  }

  /**
   * Returns all collected operations.
   *
   * @returns All collected oeprations.
   */
  public getCollectedOperations(): readonly GeneratorOutputOperation[] {
    return this.operations
  }

  /**
   * Generates the final string of all generated code for the given type.
   *
   * @param type - The generated code type.
   *
   * @returns The code as a single string or null if it would result in an empty string.
   */
  public buildCodeGroupString(
    type: GeneratedCodeType,
    outputType: GeneratedCodeOutputType,
  ): string | null {
    const items = this.code.filter((v) => v.type === type)
    const code = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => {
        const output = v.code[outputType]
        if (!output) {
          return null
        }

        if (v.comment) {
          return `${v.comment}\n${output}`
        }

        return output
      })
      .filter(notNullish)
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
    outputType: GeneratedCodeOutputType,
    types: GeneratedCodeType[] = DEFAULT_SORTING,
    options: GeneratorOutputOptions = {},
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

      if (types && !types.includes(code.type)) {
        continue
      }

      included.push(code.id)
    }

    const groupOrder = options?.sorting || DEFAULT_SORTING
    const groups = [...types].sort(
      (a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b),
    )

    const source = groups
      .map((type) => this.buildCodeGroupString(type, outputType))
      .filter(notNullish)
      .join('\n\n\n')
      .trim()

    return new GeneratorOutputFile(
      source,
      [...allDependencies.values()].filter((id) => {
        return !included.includes(id)
      }),
      outputType,
    )
  }

  /**
   * Returns types only.
   *
   * This excludes code types that are potentially not type-only, such as enum consts or helpers.
   */
  public getOperations(
    outputType: GeneratedCodeOutputType = 'ts',
    options?: GeneratorOutputOptions,
  ): GeneratorOutputFile {
    return this.buildFile(outputType, undefined, options)
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
   *
   * @example Output:
   * ```javascript
   * const category = `fragment category on Category{related{...relatedEntity}}`;
   * const nodeArticle = `fragment nodeArticle on NodeArticle{categories{...category}}`;
   * const relatedEntity = `fragment relatedEntity on Entity{id}`;
   *
   * export const operations = {
   *  query: {
   *    'foobar':
   *      `query foobar{getRandomEntity{...nodeArticle}}` +
   *      relatedEntity +
   *      category +
   *      nodeArticle,
   *  },
   *  mutation: {},
   *  subscription: {}
   * }
   * ```
   *
   * Importing `operations` and accessing `operations.query.foobar` will give you
   * the full operation, including all fragments needed for the operation.
   */
  public getOperationsFile(
    options?: GenerateOperationsFileOptions,
  ): GeneratorOutputFile {
    return generateOperationsFile(this.code, options)
  }

  /**
   * Generates a TypeScript file containing all operations, grouped by operation
   * type, with response and variable types.
   *
   * @param options - The options.
   * @param options.importFrom - The path from which the types can be imported from.
   *
   * @returns The output file.
   *
   * @example Output:
   * ```ts
   * import { FoobarQuery, FoobarQueryVariables } from './operation-types'
   *
   * export type Query = {
   *   foobar: { response: FoobarQuery, variables: FoobarQueryVariables, needsVariables: false }
   * }
   *
   * export type Mutation = {}
   *
   * export type Subscription = {}
   *
   * export type Operations = {
   *   query: Query,
   *   mutation: Mutation,
   *   subscription: Subscription,
   * }
   * ```
   */
  public getOperationTypesFile(options?: {
    importFrom?: string
  }): GeneratorOutputFile {
    return generateOperationTypes(this.operations, options?.importFrom)
  }
}
