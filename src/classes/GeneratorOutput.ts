import { getCodeTypeLabel } from '../helpers/generator.js'
import { notNullish } from '../helpers/type.js'
import type { GeneratedCode, GeneratedCodeType } from '../types/index.js'

const DEFAULT_SORTING: GeneratedCodeType[] = [
  'enum',
  'concrete-typename',
  'typename-union',
  'fragment',
  'operation',
  'input',
]

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

  getAll(options?: GeneratorOutputOptions): string {
    const grouped = this.code.reduce<
      Partial<Record<GeneratedCodeType, GeneratedCode[]>>
    >((acc, value) => {
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
        const join = type === 'concrete-typename' ? '\n' : '\n\n'
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
}
