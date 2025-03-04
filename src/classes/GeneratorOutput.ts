import { NodeLocMissingError } from '../errors'
import { getCodeTypeLabel } from '../helpers/generator'
import { notNullish } from '../helpers/type'
import type { GeneratedCode, GeneratedCodeType } from '../types/index'
import { KEY_SEPARATOR } from './DependencyTracker'
import { stripIgnoredCharacters } from 'graphql'

const DEFAULT_SORTING: GeneratedCodeType[] = [
  'enum',
  'typename-object',
  'typename-union',
  'fragment',
  'operation',
  'operation-variables',
  'input',
  'helpers',
]

function toValidString(str: string): string {
  return stripIgnoredCharacters(str).replaceAll('`', '\\`')
}

export type GeneratorOutputOptions = {
  /**
   * How each block should be sorted.
   */
  sorting?: GeneratedCodeType[]
}

export class GeneratorOutput {
  private code: GeneratedCode[]

  constructor(code: GeneratedCode[]) {
    this.code = code
  }

  getGeneratedCode(): GeneratedCode[] {
    return this.code
  }

  private buildOutput(
    types: GeneratedCodeType[] = [],
    options?: GeneratorOutputOptions,
  ) {
    const grouped = this.code.reduce<
      Partial<Record<GeneratedCodeType, GeneratedCode[]>>
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
    return this.buildOutput(typesOnly, options)
  }

  /**
   * Get everything.
   */
  public getAll(options?: GeneratorOutputOptions): string {
    return this.buildOutput(DEFAULT_SORTING, options)
  }

  /**
   * Get the operations map.
   */
  public getOperations(): string {
    let outputDeclarations = ''
    let outputQuery = 'const query = {\n'
    let outputMutation = 'const mutation = {\n'
    let outputSubscription = 'const subscription = {\n'

    for (const code of this.code) {
      if (code.type === 'fragment') {
        if (code.source === null) {
          throw new NodeLocMissingError(code.graphqlName || code.name)
        }
        outputDeclarations +=
          `const fragment_${code.graphqlName} = ` +
          '`' +
          toValidString(code.source) +
          '`;\n'
      } else if (code.type === 'operation') {
        if (code.source === null) {
          throw new NodeLocMissingError(code.graphqlName || code.name)
        }
        const operationVarName = `operation_${code.identifier!}_${code.graphqlName || code.name}`
        outputDeclarations +=
          `const ${operationVarName} = ` +
          '`' +
          toValidString(code.source) +
          '`;\n'
        const fragmentDependencies = code.dependencies
          .map((dependency) => {
            const [type, name] = dependency.split(KEY_SEPARATOR)
            if (type === 'fragment-name') {
              return 'fragment_' + name
            }
            return null
          })
          .filter(notNullish)
        const parts = [operationVarName, ...fragmentDependencies].join(' + ')

        const declaration = `  '${code.graphqlName!}': ${parts},\n`
        if (code.identifier === 'query') {
          outputQuery += declaration
        } else if (code.identifier === 'mutation') {
          outputMutation += declaration
        } else if (code.identifier === 'subscription') {
          outputSubscription += declaration
        }
      }
    }

    outputQuery += '}'
    outputMutation += '}'
    outputSubscription += '}'

    return `
${outputDeclarations}

${outputQuery}

${outputMutation}

${outputSubscription}

const operations = {
  query,
  mutation,
  subscription
}
export { operations }
`
  }
}
