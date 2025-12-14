import { describe, expect, it } from 'vitest'
import { GeneratorOutput } from '../../../src/classes/GeneratorOutput'
import type { GeneratedCode } from '../../../src/types'

describe('GeneratorOutput', () => {
  describe('buildCodeGroupString', () => {
    it('should return null when code item has no output for requested type', () => {
      // Create a code item with empty output for 'd.ts'
      const codeWithEmptyOutput: GeneratedCode = {
        id: 'test-1',
        type: 'fragment',
        name: 'TestFragment',
        graphqlName: 'testFragment',
        code: {
          ts: 'type TestFragment = { id: string }',
          'd.ts': '', // Empty string - should trigger the !output check
          js: '',
        },
      }

      const output = new GeneratorOutput([codeWithEmptyOutput], [], [])
      const result = output.buildCodeGroupString('fragment', 'd.ts')

      // Should return null because the only fragment has empty 'd.ts' output
      expect(result).toBe(null)
    })

    it('should return null when code item output is undefined', () => {
      // Create a code item with undefined output for a type
      const codeWithUndefinedOutput: GeneratedCode = {
        id: 'test-1',
        type: 'enum',
        name: 'TestEnum',
        graphqlName: 'TestEnum',
        code: {
          ts: 'type TestEnum = "A" | "B"',
          // 'd.ts' and 'js' are not defined
        } as any,
      }

      const output = new GeneratorOutput([codeWithUndefinedOutput], [], [])
      const result = output.buildCodeGroupString('enum', 'd.ts')

      expect(result).toBe(null)
    })
  })

  describe('getOperationDocumentWithFragments', () => {
    it('should throw error when operation has no source', () => {
      // Create an operation code item without source
      const operationWithoutSource: GeneratedCode = {
        id: 'op-1',
        type: 'operation',
        name: 'TestQuery',
        graphqlName: 'testQuery',
        identifier: 'query',
        code: {
          ts: 'type TestQuery = { field: string }',
          'd.ts': '',
          js: '',
        },
        source: null, // No source - should trigger the error
      }

      const output = new GeneratorOutput([operationWithoutSource], [], [])

      expect(() =>
        output.getOperationDocumentWithFragments('testQuery'),
      ).toThrow('Operation "testQuery" has no source.')
    })

    it('should throw error when operation source is undefined', () => {
      const operationWithUndefinedSource: GeneratedCode = {
        id: 'op-1',
        type: 'operation',
        name: 'TestQuery',
        graphqlName: 'testQuery',
        identifier: 'query',
        code: {
          ts: 'type TestQuery = { field: string }',
          'd.ts': '',
          js: '',
        },
        source: undefined,
      }

      const output = new GeneratorOutput([operationWithUndefinedSource], [], [])

      expect(() =>
        output.getOperationDocumentWithFragments('testQuery'),
      ).toThrow('Operation "testQuery" has no source.')
    })
  })

  describe('getFragmentDocumentWithFragments', () => {
    it('should throw error when fragment has no source', () => {
      // Create a fragment code item without source
      const fragmentWithoutSource: GeneratedCode = {
        id: 'frag-1',
        type: 'fragment',
        name: 'TestFragment',
        graphqlName: 'testFragment',
        code: {
          ts: 'type TestFragment = { id: string }',
          'd.ts': '',
          js: '',
        },
        source: null, // No source - should trigger the error
      }

      const output = new GeneratorOutput([fragmentWithoutSource], [], [])

      expect(() =>
        output.getFragmentDocumentWithFragments('testFragment'),
      ).toThrow('Fragment "testFragment" has no source.')
    })

    it('should throw error when fragment source is undefined', () => {
      const fragmentWithUndefinedSource: GeneratedCode = {
        id: 'frag-1',
        type: 'fragment',
        name: 'TestFragment',
        graphqlName: 'testFragment',
        code: {
          ts: 'type TestFragment = { id: string }',
          'd.ts': '',
          js: '',
        },
        source: undefined,
      }

      const output = new GeneratorOutput([fragmentWithUndefinedSource], [], [])

      expect(() =>
        output.getFragmentDocumentWithFragments('testFragment'),
      ).toThrow('Fragment "testFragment" has no source.')
    })
  })
})
