import { describe, expect, it } from 'vitest'
import { toPascalCase } from '../../../src/helpers/string.js'

describe('toPascalCase', () => {
  // Basic transformations
  it('should convert a simple lowercase string to PascalCase', () => {
    expect(toPascalCase('hello')).toBe('Hello')
  })

  it('should convert a simple space-separated string to PascalCase', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld')
  })

  it('should handle multiple consecutive spaces', () => {
    expect(toPascalCase('hello    world')).toBe('HelloWorld')
  })

  // Handling different case styles
  it('should properly handle camelCase strings', () => {
    expect(toPascalCase('helloWorld')).toBe('HelloWorld')
  })

  it('should handle strings already in PascalCase', () => {
    expect(toPascalCase('HelloWorld')).toBe('HelloWorld')
  })

  it('should convert kebab-case strings to PascalCase', () => {
    expect(toPascalCase('hello-world')).toBe('HelloWorld')
  })

  it('should convert snake_case strings to PascalCase', () => {
    expect(toPascalCase('hello_world')).toBe('HelloWorld')
  })

  // Special characters and punctuation
  it('should handle strings with special characters', () => {
    expect(toPascalCase('hello!world')).toBe('HelloWorld')
    expect(toPascalCase('hello@world')).toBe('HelloWorld')
    expect(toPascalCase('hello#world')).toBe('HelloWorld')
  })

  it('should handle strings with mixed separators', () => {
    expect(toPascalCase('hello-world_example')).toBe('HelloWorldExample')
  })

  // Unicode characters
  it('should handle strings with non-ASCII characters', () => {
    expect(toPascalCase('hôtel-café')).toBe('HôtelCafé')
    expect(toPascalCase('über_driver')).toBe('ÜberDriver')
  })

  // Edge cases
  it('should handle empty strings', () => {
    expect(toPascalCase('')).toBe('')
  })

  it('should handle single character strings', () => {
    expect(toPascalCase('a')).toBe('A')
  })

  it('should handle strings with only special characters', () => {
    expect(toPascalCase('!@#$%')).toBe('')
  })

  it('should handle strings with numbers', () => {
    expect(toPascalCase('hello123world')).toBe('Hello123World')
    expect(toPascalCase('123hello')).toBe('123Hello')
  })

  // Complex combinations
  it('should handle complex mixed case and separator combinations', () => {
    expect(toPascalCase('hello-World_EXAMPLE test')).toBe(
      'HelloWorldExampleTest',
    )
  })

  it('should handle repeated special characters and separators', () => {
    expect(toPascalCase('hello---world___example')).toBe('HelloWorldExample')
  })

  // Leading/trailing characters
  it('should handle strings with leading/trailing spaces', () => {
    expect(toPascalCase('  hello world  ')).toBe('HelloWorld')
  })

  it('should handle strings with leading/trailing special characters', () => {
    expect(toPascalCase('---hello world---')).toBe('HelloWorld')
  })

  // Unicode categories
  it('should handle different Unicode letter categories', () => {
    expect(toPascalCase('κόσμε-привет')).toBe('ΚόσμεПривет')
  })
})
