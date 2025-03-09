import { describe, it, expect } from 'vitest'
import {
  getCodeTypeLabel,
  toInputDocuments,
} from '../../../src/helpers/generator'
import { NO_FILE_PATH } from '../../../src/constants'
import { parse } from 'graphql'

describe('toInputDocuments', () => {
  // Test case 1: Simple string input
  it('should handle a single string input', () => {
    const query = `query { user { id name } }`
    const result = toInputDocuments(query)

    expect(result).toHaveLength(1)
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
    expect(result[0]?.documentNode).toEqual(parse(query))
  })

  // Test case 2: Array of strings
  it('should handle an array of strings', () => {
    const queries = [
      `query GetUser { user { id } }`,
      `query GetPosts { posts { title } }`,
    ]

    const result = toInputDocuments(queries)

    expect(result).toHaveLength(2)
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
    expect(result[0]?.documentNode).toEqual(parse(queries[0]!))
    expect(result[1]?.filePath).toBe(NO_FILE_PATH)
    expect(result[1]?.documentNode).toEqual(parse(queries[1]!))
  })

  // Test case 3: Input with documentNode
  it('should handle input with documentNode property', () => {
    const query = `query { user { id } }`
    const documentNode = parse(query)
    const input = { documentNode }

    const result = toInputDocuments(input)

    expect(result).toHaveLength(1)
    expect(result[0]?.documentNode).toBe(documentNode)
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
  })

  // Test case 4: Input with documentNode and filePath
  it('should handle input with documentNode and filePath properties', () => {
    const query = `query { user { id } }`
    const documentNode = parse(query)
    const filePath = 'path/to/file.graphql'
    const input = { documentNode, filePath }

    const result = toInputDocuments(input)

    expect(result).toHaveLength(1)
    expect(result[0]?.documentNode).toBe(documentNode)
    expect(result[0]?.filePath).toBe(filePath)
  })

  // Test case 5: Input with document
  it('should handle input with document property', () => {
    const document = `query { user { id } }`
    const input = { document }

    const result = toInputDocuments(input)

    expect(result).toHaveLength(1)
    expect(result[0]?.documentNode).toEqual(parse(document))
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
  })

  // Test case 6: Input with document and filePath
  it('should handle input with document and filePath properties', () => {
    const document = `query { user { id } }`
    const filePath = 'path/to/file.graphql'
    const input = { document, filePath }

    const result = toInputDocuments(input)

    expect(result).toHaveLength(1)
    expect(result[0]?.documentNode).toEqual(parse(document))
    expect(result[0]?.filePath).toBe(filePath)
  })

  // Test case 7: Input with DocumentNode directly
  it('should handle a DocumentNode input directly', () => {
    const query = `query { user { id } }`
    const documentNode = parse(query)

    const result = toInputDocuments(documentNode)

    expect(result).toHaveLength(1)
    expect(result[0]?.documentNode).toBe(documentNode)
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
  })

  // Test case 8: Array of mixed input types
  it('should handle an array of mixed input types', () => {
    const query1 = `query GetUser { user { id } }`
    const query2 = `query GetPosts { posts { title } }`
    const documentNode = parse(query2)

    const mixedInputs = [
      query1,
      { documentNode },
      { document: query2, filePath: 'path/to/file.graphql' },
    ]

    const result = toInputDocuments(mixedInputs)

    expect(result).toHaveLength(3)
    expect(result[0]?.documentNode).toEqual(parse(query1))
    expect(result[0]?.filePath).toBe(NO_FILE_PATH)
    expect(result[1]?.documentNode).toBe(documentNode)
    expect(result[1]?.filePath).toBe(NO_FILE_PATH)
    expect(result[2]?.documentNode).toEqual(parse(query2))
    expect(result[2]?.filePath).toBe('path/to/file.graphql')
  })
})

describe('getCodeTypeLabel', () => {
  it('should return the correct label', () => {
    expect(getCodeTypeLabel('typename-object')).toEqual('Object Types')
    expect(getCodeTypeLabel('helpers')).toEqual('Helpers')
    expect(getCodeTypeLabel('operation')).toEqual('Operations')
  })
})
