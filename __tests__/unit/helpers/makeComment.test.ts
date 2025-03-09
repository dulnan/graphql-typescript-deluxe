import { describe, it, expect } from 'vitest'
import { makeComment } from '../../../src/helpers/string.js'

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
