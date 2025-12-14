import { describe, it, expect } from 'vitest'
import { makeComment, makeTypeDoc } from '../../../src/helpers/string.js'
import { GraphQLObjectType, GraphQLString, parse } from 'graphql'

describe('makeComment', () => {
  it('should wrap normal text in comment delimiters', () => {
    const input = 'Hello, world!'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`"/** Hello, world! */"`)
  })

  it('should handle empty strings', () => {
    const input = ''
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`"/**  */"`)
  })

  it('should escape comment close delimiters in the input', () => {
    const input = 'This has a */ comment close in it'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(
      `"/** This has a *\\/ comment close in it */"`,
    )
  })

  it('should handle multiple comment close delimiters', () => {
    const input = 'Multiple */ comment */ closes'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(
      `"/** Multiple *\\/ comment *\\/ closes */"`,
    )
  })

  it('should preserve other special characters', () => {
    const input = '/** @param {string} name */'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(
      `"/** /** @param {string} name *\\/ */"`,
    )
  })

  it('should handle comment close delimiter at the start', () => {
    const input = '*/ at the start'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`"/** *\\/ at the start */"`)
  })

  it('should handle comment close delimiter at the end', () => {
    const input = 'at the end */'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`"/** at the end *\\/ */"`)
  })

  it('should handle strings containing only comment close delimiters', () => {
    const input = '*/'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`"/** *\\/ */"`)
  })

  it('should handle multiline strings', () => {
    const input = 'Line 1\nLine 2 */\nLine 3'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(`
      "/**
       * Line 1
       * Line 2 *\\/
       * Line 3
       */"
    `)
  })

  it('should handle strings with multiple consecutive comment close delimiters', () => {
    const input = 'Multiple */*/*/*/ consecutive'
    const result = makeComment(input)
    expect(result).toMatchInlineSnapshot(
      `"/** Multiple *\\/*\\/*\\/*\\/ consecutive */"`,
    )
  })
})

describe('makeTypeDoc', () => {
  const allOptionsEnabled = {
    typeDescription: true,
    fieldDescription: true,
    link: true,
    source: true,
  }

  const allOptionsDisabled = {
    typeDescription: false,
    fieldDescription: false,
    link: false,
    source: false,
  }

  it('should return empty string when no content', () => {
    const result = makeTypeDoc(
      { filePath: undefined, type: undefined, definition: undefined },
      allOptionsDisabled,
    )
    expect(result).toBe('')
  })

  it('should include type description when enabled', () => {
    const type = new GraphQLObjectType({
      name: 'TestType',
      description: 'A test type description',
      fields: { id: { type: GraphQLString } },
    })

    const result = makeTypeDoc(
      { type, filePath: undefined, definition: undefined },
      allOptionsEnabled,
    )
    expect(result).toContain('A test type description')
  })

  it('should include file path link when enabled', () => {
    const result = makeTypeDoc(
      {
        filePath: '/path/to/file.graphql',
        type: undefined,
        definition: undefined,
      },
      allOptionsEnabled,
    )
    expect(result).toContain('@see {@link file:///path/to/file.graphql}')
  })

  it('should add empty line between description and link', () => {
    const type = new GraphQLObjectType({
      name: 'TestType',
      description: 'A description',
      fields: { id: { type: GraphQLString } },
    })

    const result = makeTypeDoc(
      { type, filePath: '/path/to/file.graphql', definition: undefined },
      allOptionsEnabled,
    )
    // Should have description, empty line, then link
    expect(result).toContain('A description')
    expect(result).toContain('@see {@link file:///path/to/file.graphql}')
    // Verify there's a blank line (empty * line) between them
    expect(result).toMatch(/A description\n \* \n \* @see/)
  })

  it('should not include link when filePath is NO_FILE_PATH', () => {
    const result = makeTypeDoc(
      { filePath: '', type: undefined, definition: undefined },
      allOptionsEnabled,
    )
    expect(result).not.toContain('@see')
  })

  it('should include source when definition has loc', () => {
    const doc = parse('type Query { field: String }')
    const definition = doc.definitions[0] as any

    const result = makeTypeDoc(
      { definition, filePath: undefined, type: undefined },
      allOptionsEnabled,
    )
    expect(result).toContain('@example')
    expect(result).toContain('```graphql')
    expect(result).toContain('type Query')
  })

  it('should respect disabled options', () => {
    const type = new GraphQLObjectType({
      name: 'TestType',
      description: 'A description',
      fields: { id: { type: GraphQLString } },
    })
    const doc = parse('type Query { field: String }')
    const definition = doc.definitions[0] as any

    const result = makeTypeDoc(
      { type, filePath: '/path/to/file.graphql', definition },
      allOptionsDisabled,
    )
    expect(result).toBe('')
  })
})
