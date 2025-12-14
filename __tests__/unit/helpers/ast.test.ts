import { describe, expect, it } from 'vitest'
import { Kind, parse } from 'graphql'
import type { FieldNode, SelectionSetNode } from 'graphql'
import {
  unwrapNonNull,
  hasConditionalDirective,
  mergeSameFieldSelections,
  getTypeNodeKey,
  getAstSource,
} from '../../../src/helpers/ast'

describe('ast helpers', () => {
  describe('unwrapNonNull', () => {
    it('should unwrap non-null type', () => {
      const doc = parse('type Query { field: String! }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      const result = unwrapNonNull(fieldType)
      expect(result.isNonNull).toBe(true)
      expect(result.type.kind).toBe(Kind.NAMED_TYPE)
    })

    it('should return type as-is for nullable type', () => {
      const doc = parse('type Query { field: String }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      const result = unwrapNonNull(fieldType)
      expect(result.isNonNull).toBe(false)
      expect(result.type).toBe(fieldType)
    })
  })

  describe('hasConditionalDirective', () => {
    it('should return false when field has no directives', () => {
      const doc = parse('{ field }')
      const operation = doc.definitions[0] as any
      const fieldNode = operation.selectionSet.selections[0] as FieldNode

      expect(hasConditionalDirective(fieldNode)).toBe(false)
    })

    it('should return false when directives is undefined', () => {
      // Create a FieldNode with explicitly undefined directives
      const fieldNode: FieldNode = {
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: 'testField' },
        directives: undefined,
      }

      expect(hasConditionalDirective(fieldNode)).toBe(false)
    })

    it('should return false when field has non-conditional directives', () => {
      const doc = parse('{ field @deprecated }')
      const operation = doc.definitions[0] as any
      const fieldNode = operation.selectionSet.selections[0] as FieldNode

      expect(hasConditionalDirective(fieldNode)).toBe(false)
    })

    it('should return true when field has @skip directive', () => {
      const doc = parse('{ field @skip(if: true) }')
      const operation = doc.definitions[0] as any
      const fieldNode = operation.selectionSet.selections[0] as FieldNode

      expect(hasConditionalDirective(fieldNode)).toBe(true)
    })

    it('should return true when field has @include directive', () => {
      const doc = parse('{ field @include(if: true) }')
      const operation = doc.definitions[0] as any
      const fieldNode = operation.selectionSet.selections[0] as FieldNode

      expect(hasConditionalDirective(fieldNode)).toBe(true)
    })
  })

  describe('mergeSameFieldSelections', () => {
    it('should merge duplicate field selections', () => {
      const doc = parse('{ user { name } user { email } }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      // Should merge into single 'user' field
      expect(result.selections.length).toBe(1)
      const userField = result.selections[0] as FieldNode
      expect(userField.name.value).toBe('user')
      // Should have both name and email in nested selections
      expect(userField.selectionSet?.selections.length).toBe(2)
    })

    it('should preserve non-field selections (inline fragments)', () => {
      const doc = parse('{ ... on User { name } field }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      // Should have field + inline fragment
      expect(result.selections.length).toBe(2)
      const hasInlineFragment = result.selections.some(
        (s) => s.kind === Kind.INLINE_FRAGMENT,
      )
      expect(hasInlineFragment).toBe(true)
    })

    it('should preserve fragment spreads', () => {
      const doc = parse('{ ...UserFields field }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      // Should have field + fragment spread
      expect(result.selections.length).toBe(2)
      const hasFragmentSpread = result.selections.some(
        (s) => s.kind === Kind.FRAGMENT_SPREAD,
      )
      expect(hasFragmentSpread).toBe(true)
    })

    it('should handle single field without merging', () => {
      const doc = parse('{ name }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      expect(result.selections.length).toBe(1)
    })

    it('should handle fields with aliases', () => {
      const doc = parse('{ userName: name userEmail: email }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      expect(result.selections.length).toBe(2)
    })

    it('should merge fields with same alias', () => {
      const doc = parse('{ u: user { name } u: user { email } }')
      const operation = doc.definitions[0] as any
      const selectionSet = operation.selectionSet as SelectionSetNode

      const result = mergeSameFieldSelections(selectionSet)

      expect(result.selections.length).toBe(1)
      const userField = result.selections[0] as FieldNode
      expect(userField.alias?.value).toBe('u')
    })
  })

  describe('getTypeNodeKey', () => {
    it('should generate key for named type', () => {
      const doc = parse('type Query { field: String }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      expect(getTypeNodeKey(fieldType)).toBe('String')
    })

    it('should generate key for list type', () => {
      const doc = parse('type Query { field: [String] }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      expect(getTypeNodeKey(fieldType)).toBe('list-String')
    })

    it('should generate key for non-null type', () => {
      const doc = parse('type Query { field: String! }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      expect(getTypeNodeKey(fieldType)).toBe('non-null-String')
    })

    it('should generate key for nested list/non-null types', () => {
      const doc = parse('type Query { field: [String!]! }')
      const typeDef = doc.definitions[0] as any
      const fieldType = typeDef.fields[0].type

      expect(getTypeNodeKey(fieldType)).toBe('non-null-list-non-null-String')
    })
  })

  describe('getAstSource', () => {
    it('should extract source from operation definition', () => {
      const doc = parse('query Test { field }')
      const operation = doc.definitions[0] as any

      const source = getAstSource(operation)

      expect(source).toBe('query Test { field }')
    })

    it('should extract source from fragment definition', () => {
      const doc = parse('fragment Test on User { name }')
      const fragment = doc.definitions[0] as any

      const source = getAstSource(fragment)

      expect(source).toBe('fragment Test on User { name }')
    })

    it('should return null when loc is missing', () => {
      // Create a node without loc
      const node = {
        kind: Kind.OPERATION_DEFINITION,
        operation: 'query',
        selectionSet: { kind: Kind.SELECTION_SET, selections: [] },
      } as any

      const source = getAstSource(node)

      expect(source).toBe(null)
    })
  })
})
