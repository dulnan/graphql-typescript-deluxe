import { describe, it, expect, beforeEach } from 'vitest'
import { DependencyTracker } from '../../../src/classes/DependencyTracker'
import { NO_FILE_PATH } from '../../../src/constants'
import { LogicError } from '../../../src'

describe('DependencyTracker', () => {
  let tracker: DependencyTracker

  beforeEach(() => {
    tracker = new DependencyTracker()
  })

  describe('static toKey', () => {
    it('should join type and key with the separator', () => {
      const result = DependencyTracker.toKey('operation', 'MyQuery')
      expect(result).toBe('operation#####MyQuery')
    })
  })

  describe('start', () => {
    it('should initialize a new stack set', () => {
      tracker.start()
      expect(tracker.hasStack()).toBe(true)
    })

    it('should set the current file path and add a file dependency when provided', () => {
      const filePath = 'path/to/file.ts'
      tracker.start(filePath)

      // Using the end method to get dependencies and check if file was added
      const dependencies = tracker.end()
      expect(dependencies).toContain(DependencyTracker.toKey('file', filePath))
    })

    it('should maintain the default NO_FILE_PATH when no file is provided', () => {
      tracker.start()
      expect(tracker.getCurrentFile()).toBe(NO_FILE_PATH)
    })
  })

  describe('add', () => {
    it('should add a dependency with the correct key format', () => {
      tracker.start()
      tracker.add('operation', 'MyQuery')

      const dependencies = tracker.end()
      expect(dependencies).toContain(
        DependencyTracker.toKey('operation', 'MyQuery'),
      )
    })

    it('should throw a LogicError when trying to add without starting a stack', () => {
      expect(() => tracker.add('operation', 'MyQuery')).toThrow(LogicError)
      expect(() => tracker.add('operation', 'MyQuery')).toThrow(
        'Tried to add dependency but no stack available.',
      )
    })
  })

  describe('merge', () => {
    it('should add a file dependency and all provided dependencies', () => {
      tracker.start()

      const data = {
        filePath: 'path/to/other/file.ts',
        dependencies: [
          DependencyTracker.toKey('enum', 'Status'),
          DependencyTracker.toKey('input', 'UserInput'),
        ],
      }

      tracker.merge(data)

      const dependencies = tracker.end()
      expect(dependencies).toContain(
        DependencyTracker.toKey('file', data.filePath),
      )
      expect(dependencies).toContain(data.dependencies[0])
      expect(dependencies).toContain(data.dependencies[1])
    })

    it('should throw a LogicError when trying to merge without starting a stack', () => {
      const data = {
        filePath: 'path/to/file.ts',
        dependencies: [DependencyTracker.toKey('enum', 'Status')],
      }

      expect(() => tracker.merge(data)).toThrow(LogicError)
      expect(() => tracker.merge(data)).toThrow(
        'Tried to add dependency but no stack available.',
      )
    })
  })

  describe('end', () => {
    it('should return all dependencies and remove the current stack', () => {
      tracker.start('path/to/file.ts')
      tracker.add('operation', 'MyQuery')
      tracker.add('fragment', 'UserFragment')

      const dependencies = tracker.end()

      expect(dependencies).toContain(
        DependencyTracker.toKey('operation', 'MyQuery'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('fragment', 'UserFragment'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('file', 'path/to/file.ts'),
      )
      expect(tracker.hasStack()).toBe(false)
    })

    it('should throw a LogicError when trying to end without a stack', () => {
      expect(() => tracker.end()).toThrow(LogicError)
      expect(() => tracker.end()).toThrow(
        'Tried to pop dependency stack, but no stack available.',
      )
    })

    it('should merge dependencies with parent stack when nested', () => {
      tracker.start('parent/file.ts')
      tracker.add('enum', 'Status')

      tracker.start('child/file.ts')
      tracker.add('input', 'UserInput')

      // End the child stack
      const childDependencies = tracker.end()
      expect(childDependencies).toContain(
        DependencyTracker.toKey('input', 'UserInput'),
      )
      expect(childDependencies).toContain(
        DependencyTracker.toKey('file', 'child/file.ts'),
      )

      // End the parent stack and verify it contains merged dependencies
      const parentDependencies = tracker.end()
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('enum', 'Status'),
      )
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('file', 'parent/file.ts'),
      )
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('file', 'child/file.ts'),
      )
    })
  })

  describe('getCurrentFile', () => {
    it('should return the current file path', () => {
      const filePath = 'path/to/file.ts'
      tracker.start(filePath)
      expect(tracker.getCurrentFile()).toBe(filePath)
    })

    it('should return NO_FILE_PATH by default', () => {
      expect(tracker.getCurrentFile()).toBe(NO_FILE_PATH)
    })
  })

  describe('hasStack', () => {
    it('should return true when a stack exists', () => {
      tracker.start()
      expect(tracker.hasStack()).toBe(true)
    })

    it('should return false when no stack exists', () => {
      expect(tracker.hasStack()).toBe(false)

      tracker.start()
      tracker.end()
      expect(tracker.hasStack()).toBe(false)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple nested dependency tracking sessions', () => {
      // Start parent tracking
      tracker.start('parent.ts')
      tracker.add('enum', 'ParentEnum')

      // Start first child tracking
      tracker.start('child1.ts')
      tracker.add('input', 'Child1Input')
      tracker.add('fragment', 'Child1Fragment')
      const child1Dependencies = tracker.end()

      // Start second child tracking
      tracker.start('child2.ts')
      tracker.add('operation', 'Child2Query')
      const child2Dependencies = tracker.end()

      // End parent tracking
      const parentDependencies = tracker.end()

      // Verify child dependencies
      expect(child1Dependencies).toContain(
        DependencyTracker.toKey('input', 'Child1Input'),
      )
      expect(child1Dependencies).toContain(
        DependencyTracker.toKey('fragment', 'Child1Fragment'),
      )
      expect(child1Dependencies).toContain(
        DependencyTracker.toKey('file', 'child1.ts'),
      )

      expect(child2Dependencies).toContain(
        DependencyTracker.toKey('operation', 'Child2Query'),
      )
      expect(child2Dependencies).toContain(
        DependencyTracker.toKey('file', 'child2.ts'),
      )

      // Verify parent dependencies include all child dependencies
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('enum', 'ParentEnum'),
      )
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('file', 'parent.ts'),
      )
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('file', 'child1.ts'),
      )
      expect(parentDependencies).toContain(
        DependencyTracker.toKey('file', 'child2.ts'),
      )
    })

    it('should handle multiple nested dependency tracking sessions correctly', () => {
      // Start parent tracking
      tracker.start('query.one.graphql')
      tracker.add('operation', 'queryOne')

      tracker.start('fragment.one.graphql')
      tracker.addFragment('one')
      tracker.start('fragment.two.graphql')
      tracker.merge({ dependencies: ['fragment-name####four'], filePath: '' })
      tracker.addFragment('two')
      tracker.start('fragment.three.graphql')
      tracker.addFragment('three')
      tracker.end()
      tracker.end()
      tracker.end()
      const dependencies = tracker.end()
      expect(tracker.hasStack()).toBeFalsy()
      expect(dependencies.filter((v) => v.includes('fragment-name')))
        .toMatchInlineSnapshot(`
          [
            "fragment-name####four",
            "fragment-name#####three",
            "fragment-name#####two",
            "fragment-name#####one",
          ]
        `)
    })

    it('should correctly handle all supported GeneratedCodeType values', () => {
      tracker.start('test.ts')

      // Add all supported types
      tracker.add('enum', 'TestEnum')
      tracker.add('input', 'TestInput')
      tracker.add('fragment', 'TestFragment')
      tracker.add('operation', 'TestOperation')
      tracker.add('typename-object', 'TestTypenameObject')
      tracker.add('typename-union', 'TestTypenameUnion')
      tracker.add('helpers', 'TestHelper')

      const dependencies = tracker.end()

      // Verify all types were added correctly
      expect(dependencies).toContain(
        DependencyTracker.toKey('enum', 'TestEnum'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('input', 'TestInput'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('fragment', 'TestFragment'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('operation', 'TestOperation'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('typename-object', 'TestTypenameObject'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('typename-union', 'TestTypenameUnion'),
      )
      expect(dependencies).toContain(
        DependencyTracker.toKey('helpers', 'TestHelper'),
      )
    })
  })
})
