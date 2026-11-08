import { describe, expect, it } from 'vitest'
import { OPTION_SETS } from '../optionSets'

describe('Soundness', () => {
  it('has a test file for every option set', () => {
    const files = Object.keys(import.meta.glob('./set*.test.ts'))
    expect(files.sort()).toEqual(
      OPTION_SETS.map((_, i) => `./set${i + 1}.test.ts`).sort(),
    )
  })
})
