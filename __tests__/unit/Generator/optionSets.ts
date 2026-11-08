import type { GeneratorOptionsOutput } from '../../../src/types/options'

/**
 * The output options that change the generated types.
 */
export type TypeOptions = Required<
  Pick<
    GeneratorOptionsOutput,
    | 'nullableField'
    | 'nonOptionalTypename'
    | 'mergeTypenames'
    | 'emptyObject'
    | 'arrayShape'
    | 'nullableArrayElements'
    | 'sortProperties'
  >
>

type OptionSet = {
  /**
   * The options that differ from the defaults.
   */
  label: string
  output: TypeOptions
}

const DEFAULTS: TypeOptions = {
  nullableField: 'optional',
  nonOptionalTypename: false,
  mergeTypenames: true,
  emptyObject: 'object',
  arrayShape: '$T$[]',
  nullableArrayElements: true,
  sortProperties: true,
}

const STRICT_EMPTY = 'Record<string, never>'
const GENERIC_ARRAY = 'Array<$T$>'

/**
 * Sets of the output options that change the generated types.
 *
 * Every pair of values of two options appears in at least one set (an L8
 * orthogonal array), so a bug that needs two of them is found too. The first
 * set is the defaults. The three options that shape how branches and fields
 * are merged (whether nullable fields are optional, nonOptionalTypename and
 * mergeTypenames) appear in all their combinations.
 */
export const OPTION_SETS: OptionSet[] = (
  [
    {},
    {
      mergeTypenames: false,
      arrayShape: GENERIC_ARRAY,
      nullableArrayElements: false,
      sortProperties: false,
    },
    {
      nonOptionalTypename: true,
      emptyObject: STRICT_EMPTY,
      nullableArrayElements: false,
      sortProperties: false,
    },
    {
      nonOptionalTypename: true,
      mergeTypenames: false,
      emptyObject: STRICT_EMPTY,
      arrayShape: GENERIC_ARRAY,
    },
    {
      nullableField: 'null',
      emptyObject: STRICT_EMPTY,
      arrayShape: GENERIC_ARRAY,
      sortProperties: false,
    },
    {
      nullableField: 'maybe',
      mergeTypenames: false,
      emptyObject: STRICT_EMPTY,
      nullableArrayElements: false,
    },
    {
      nullableField: 'null',
      nonOptionalTypename: true,
      arrayShape: GENERIC_ARRAY,
      nullableArrayElements: false,
    },
    {
      nullableField: 'maybe',
      nonOptionalTypename: true,
      mergeTypenames: false,
      sortProperties: false,
    },
  ] satisfies Partial<TypeOptions>[]
).map((options) => ({
  label:
    Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'defaults',
  output: { ...DEFAULTS, ...options },
}))
