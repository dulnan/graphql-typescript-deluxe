import { describe, it, expect } from 'vitest'
import { MinifyVariableName } from '../../../src/classes/MinifyVariableName'

describe('MinifyVariableName', () => {
  describe('when minification is enabled', () => {
    it('should generate minified variable names', () => {
      const minifier = new MinifyVariableName(true)

      expect(minifier.getVarName('firstVariable')).toBe('a')
      expect(minifier.getVarName('secondVariable')).toBe('b')
      expect(minifier.getVarName('thirdVariable')).toBe('c')
    })

    it('should return the same minified name for the same input', () => {
      const minifier = new MinifyVariableName(true)

      const first = minifier.getVarName('myVariable')
      const second = minifier.getVarName('myVariable')

      expect(first).toBe(second)
    })

    it('should skip reserved JavaScript keywords', () => {
      const minifier = new MinifyVariableName(true)

      // Generate enough names to potentially hit reserved words
      const names: string[] = []
      for (let i = 0; i < 30; i++) {
        names.push(minifier.getVarName(`var${i}`))
      }

      // None of the generated names should be reserved words
      const reserved = ['do', 'if', 'in']
      for (const name of names) {
        expect(reserved).not.toContain(name)
      }
    })

    it('should handle many variable names', () => {
      const minifier = new MinifyVariableName(true)

      // Generate 100 unique names
      const names = new Set<string>()
      for (let i = 0; i < 100; i++) {
        names.add(minifier.getVarName(`variable${i}`))
      }

      // All names should be unique
      expect(names.size).toBe(100)
    })
  })

  describe('when minification is disabled', () => {
    it('should return the original variable name', () => {
      const minifier = new MinifyVariableName(false)

      expect(minifier.getVarName('myLongVariableName')).toBe(
        'myLongVariableName',
      )
      expect(minifier.getVarName('anotherVariable')).toBe('anotherVariable')
    })

    it('should return original names even for reserved words', () => {
      const minifier = new MinifyVariableName(false)

      // When disabled, it just returns the original name
      expect(minifier.getVarName('const')).toBe('const')
      expect(minifier.getVarName('function')).toBe('function')
    })
  })

  describe('when isEnabled is undefined', () => {
    it('should return the original variable name', () => {
      const minifier = new MinifyVariableName()

      expect(minifier.getVarName('testVariable')).toBe('testVariable')
    })
  })
})
