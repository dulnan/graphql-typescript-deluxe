import { describe, it, expect } from 'vitest'
import {
  IR,
  mergeIR,
  mergeObjectFields,
  mergeFragmentSpread,
  isIdenticalIR,
  postProcessIR,
  hasTypenameField,
  buildFragmentIRFields,
  type IRNode,
  type IRNodeObject,
  type IRNodeScalar,
  type IRNodeTypename,
} from '../../../src/helpers/ir'

describe('IR factory functions', () => {
  it('creates SCALAR nodes', () => {
    const scalar = IR.SCALAR({ tsType: 'string' })
    expect(scalar.kind).toBe('SCALAR')
    expect(scalar.tsType).toBe('string')
  })

  it('creates SCALAR nodes with nullable', () => {
    const scalar = IR.SCALAR({ tsType: 'string', nullable: true })
    expect(scalar.nullable).toBe(true)
  })

  it('creates OBJECT nodes', () => {
    const obj = IR.OBJECT({
      graphQLTypeName: 'User',
      fields: { id: IR.SCALAR({ tsType: 'string' }) },
    })
    expect(obj.kind).toBe('OBJECT')
    expect(obj.graphQLTypeName).toBe('User')
    expect(obj.fields.id?.kind).toBe('SCALAR')
  })

  it('creates ARRAY nodes', () => {
    const arr = IR.ARRAY({
      ofType: IR.SCALAR({ tsType: 'string' }),
      nullableElement: false,
    })
    expect(arr.kind).toBe('ARRAY')
    expect(arr.nullableElement).toBe(false)
  })

  it('creates UNION nodes', () => {
    const union = IR.UNION({
      types: [IR.SCALAR({ tsType: 'string' }), IR.SCALAR({ tsType: 'number' })],
    })
    expect(union.kind).toBe('UNION')
    expect(union.types.length).toBe(2)
  })

  it('creates FRAGMENT_SPREAD nodes', () => {
    const spread = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    expect(spread.kind).toBe('FRAGMENT_SPREAD')
    expect(spread.name).toBe('UserFragment')
  })

  it('creates TYPENAME nodes with single type', () => {
    const typename = IR.TYPENAME('User')
    expect(typename.kind).toBe('TYPENAME')
    expect(typename.types).toEqual(['User'])
  })

  it('creates TYPENAME nodes with multiple types', () => {
    const typename = IR.TYPENAME(['User', 'Admin'])
    expect(typename.types).toEqual(['User', 'Admin'])
  })

  it('creates TYPENAME nodes with excludeType', () => {
    const typename = IR.TYPENAME(['User'], 'Entity')
    expect(typename.excludeType).toBe('Entity')
  })
})

describe('mergeFragmentSpread', () => {
  it('adds fragment spread to empty fields', () => {
    const fields: Record<string, IRNode> = {}
    const spread = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    mergeFragmentSpread(fields, spread)
    expect(fields['__fragment_UserFragmentType']).toBe(spread)
  })

  it('merges fragment spreads with same name', () => {
    const spread1 = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    const spread2 = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    const fields: Record<string, IRNode> = {}
    mergeFragmentSpread(fields, spread1)
    mergeFragmentSpread(fields, spread2)
    // Same fragment should just return the existing one
    expect(fields['__fragment_UserFragmentType']?.kind).toBe('FRAGMENT_SPREAD')
  })

  it('creates union when merging different fragment spreads', () => {
    const spread1 = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    const spread2 = IR.FRAGMENT_SPREAD({
      name: 'AdminFragment',
      fragmentTypeName: 'AdminFragmentType',
      fragmentTypeCondition: 'Admin',
      parentType: 'Query',
    })
    const fields: Record<string, IRNode> = {}
    mergeFragmentSpread(fields, spread1)
    // Different fragment type name - should create union
    fields['__fragment_UserFragmentType'] = spread1
    const merged = mergeIR(spread1, spread2)
    expect(merged.kind).toBe('UNION')
  })
})

describe('mergeIR', () => {
  describe('merging scalars', () => {
    it('merges identical scalar types', () => {
      const a = IR.SCALAR({ tsType: 'string' })
      const b = IR.SCALAR({ tsType: 'string' })
      const result = mergeIR(a, b) as IRNodeScalar
      expect(result.kind).toBe('SCALAR')
      expect(result.tsType).toBe('string')
    })

    it('merges different scalar types into union type', () => {
      const a = IR.SCALAR({ tsType: 'string' })
      const b = IR.SCALAR({ tsType: 'number' })
      const result = mergeIR(a, b) as IRNodeScalar
      expect(result.kind).toBe('SCALAR')
      expect(result.tsType).toBe('string | number')
    })

    it('preserves nullable from both scalars', () => {
      const a = IR.SCALAR({ tsType: 'string', nullable: true })
      const b = IR.SCALAR({ tsType: 'string', nullable: false })
      const result = mergeIR(a, b) as IRNodeScalar
      expect(result.nullable).toBe(false) // AND operation for same type
    })

    it('ORs nullable for different scalar types', () => {
      const a = IR.SCALAR({ tsType: 'string', nullable: true })
      const b = IR.SCALAR({ tsType: 'number', nullable: false })
      const result = mergeIR(a, b) as IRNodeScalar
      expect(result.nullable).toBe(true)
    })
  })

  describe('merging typename nodes', () => {
    it('merges typename nodes and removes duplicates', () => {
      const a = IR.TYPENAME(['User', 'Admin'])
      const b = IR.TYPENAME(['Admin', 'Guest'])
      const result = mergeIR(a, b) as IRNodeTypename
      expect(result.kind).toBe('TYPENAME')
      expect(result.types).toContain('User')
      expect(result.types).toContain('Admin')
      expect(result.types).toContain('Guest')
      expect(result.types.length).toBe(3)
    })

    it('preserves nullable in typename merge', () => {
      const a = IR.TYPENAME(['User'])
      a.nullable = true
      const b = IR.TYPENAME(['Admin'])
      const result = mergeIR(a, b) as IRNodeTypename
      expect(result.nullable).toBe(true)
    })
  })

  describe('merging object nodes', () => {
    it('merges object nodes with same fields', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const result = mergeIR(a, b) as IRNodeObject
      expect(result.kind).toBe('OBJECT')
      expect(result.fields.id?.kind).toBe('SCALAR')
    })

    it('merges object nodes with different fields', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { name: IR.SCALAR({ tsType: 'string' }) },
      })
      const result = mergeIR(a, b) as IRNodeObject
      expect(result.fields.id).toBeDefined()
      expect(result.fields.name).toBeDefined()
    })

    it('recursively merges nested object fields', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {
          profile: IR.OBJECT({
            graphQLTypeName: 'Profile',
            fields: { bio: IR.SCALAR({ tsType: 'string' }) },
          }),
        },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {
          profile: IR.OBJECT({
            graphQLTypeName: 'Profile',
            fields: { avatar: IR.SCALAR({ tsType: 'string' }) },
          }),
        },
      })
      const result = mergeIR(a, b) as IRNodeObject
      const profile = result.fields.profile as IRNodeObject
      expect(profile.fields.bio).toBeDefined()
      expect(profile.fields.avatar).toBeDefined()
    })
  })

  describe('merging array nodes', () => {
    it('merges array nodes', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: true,
      })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('ARRAY')
      if (result.kind === 'ARRAY') {
        expect(result.nullableElement).toBe(true) // OR operation
      }
    })

    it('recursively merges array element types', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'number' }),
        nullableElement: false,
      })
      const result = mergeIR(a, b)
      if (result.kind === 'ARRAY') {
        expect((result.ofType as IRNodeScalar).tsType).toBe('string | number')
      }
    })
  })

  describe('merging union nodes', () => {
    it('merges union nodes', () => {
      const a = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
      })
      const b = IR.UNION({
        types: [IR.SCALAR({ tsType: 'number' })],
      })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('UNION')
      if (result.kind === 'UNION') {
        expect(result.types.length).toBe(2)
      }
    })

    it('unifies union branches with same object type', () => {
      const a = IR.UNION({
        types: [
          IR.OBJECT({
            graphQLTypeName: 'User',
            fields: { id: IR.SCALAR({ tsType: 'string' }) },
          }),
        ],
      })
      const b = IR.UNION({
        types: [
          IR.OBJECT({
            graphQLTypeName: 'User',
            fields: { name: IR.SCALAR({ tsType: 'string' }) },
          }),
        ],
      })
      const result = mergeIR(a, b)
      if (result.kind === 'UNION') {
        // Should have unified the User objects
        const userObj = result.types.find(
          (t) => t.kind === 'OBJECT' && t.graphQLTypeName === 'User',
        ) as IRNodeObject
        expect(userObj).toBeDefined()
        expect(userObj.fields.id).toBeDefined()
        expect(userObj.fields.name).toBeDefined()
      }
    })

    it('handles non-object branches in unions', () => {
      const a = IR.UNION({
        types: [
          IR.SCALAR({ tsType: 'string' }),
          IR.OBJECT({ graphQLTypeName: 'User', fields: {} }),
        ],
      })
      const b = IR.UNION({
        types: [
          IR.SCALAR({ tsType: 'number' }),
          IR.OBJECT({ graphQLTypeName: 'Admin', fields: {} }),
        ],
      })
      const result = mergeIR(a, b)
      if (result.kind === 'UNION') {
        expect(result.types.length).toBe(4)
      }
    })
  })

  describe('merging fragment spread nodes', () => {
    it('keeps same fragment spread', () => {
      const a = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      const b = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('FRAGMENT_SPREAD')
    })

    it('creates union for different fragment spreads', () => {
      const a = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      const b = IR.FRAGMENT_SPREAD({
        name: 'AdminFragment',
        fragmentTypeName: 'AdminFragmentType',
        fragmentTypeCondition: 'Admin',
        parentType: 'Query',
      })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('UNION')
    })
  })

  describe('merging mismatched types', () => {
    it('creates union when merging scalar and object', () => {
      const a = IR.SCALAR({ tsType: 'string' })
      const b = IR.OBJECT({ graphQLTypeName: 'User', fields: {} })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('UNION')
    })

    it('creates union when merging array and scalar', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.SCALAR({ tsType: 'string' })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('UNION')
    })

    it('flattens nested unions when creating fallback union', () => {
      const a = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
      })
      const b = IR.SCALAR({ tsType: 'number' })
      const result = mergeIR(a, b)
      expect(result.kind).toBe('UNION')
      if (result.kind === 'UNION') {
        // Should flatten the union from a
        expect(result.types.length).toBe(2)
      }
    })
  })
})

describe('mergeObjectFields', () => {
  it('merges fields from source into target', () => {
    const target: Record<string, IRNode> = {
      id: IR.SCALAR({ tsType: 'string' }),
    }
    const source: Record<string, IRNode> = {
      name: IR.SCALAR({ tsType: 'string' }),
    }
    const result = mergeObjectFields(target, source)
    expect(result.id).toBeDefined()
    expect(result.name).toBeDefined()
  })

  it('merges overlapping fields', () => {
    const target: Record<string, IRNode> = {
      id: IR.SCALAR({ tsType: 'string' }),
    }
    const source: Record<string, IRNode> = {
      id: IR.SCALAR({ tsType: 'number' }),
    }
    const result = mergeObjectFields(target, source)
    expect((result.id as IRNodeScalar).tsType).toBe('string | number')
  })
})

describe('isIdenticalIR', () => {
  describe('scalar comparison', () => {
    it('returns true for identical scalars', () => {
      const a = IR.SCALAR({ tsType: 'string' })
      const b = IR.SCALAR({ tsType: 'string' })
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different scalar types', () => {
      const a = IR.SCALAR({ tsType: 'string' })
      const b = IR.SCALAR({ tsType: 'number' })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different nullable', () => {
      const a = IR.SCALAR({ tsType: 'string', nullable: true })
      const b = IR.SCALAR({ tsType: 'string', nullable: false })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('typename comparison', () => {
    it('returns true for identical typename nodes', () => {
      const a = IR.TYPENAME(['User', 'Admin'])
      const b = IR.TYPENAME(['User', 'Admin'])
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different typename types', () => {
      const a = IR.TYPENAME(['User'])
      const b = IR.TYPENAME(['Admin'])
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different excludeType', () => {
      const a = IR.TYPENAME(['User'], 'Entity')
      const b = IR.TYPENAME(['User'], 'Person')
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different nullable in typename', () => {
      const a = IR.TYPENAME(['User'])
      a.nullable = true
      const b = IR.TYPENAME(['User'])
      b.nullable = false
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('object comparison', () => {
    it('returns true for identical objects', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different graphQLTypeName', () => {
      const a = IR.OBJECT({ graphQLTypeName: 'User', fields: {} })
      const b = IR.OBJECT({ graphQLTypeName: 'Admin', fields: {} })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different nullable in objects', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {},
        nullable: true,
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {},
        nullable: false,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different number of fields', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {},
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different field names', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { name: IR.SCALAR({ tsType: 'string' }) },
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different field values', () => {
      const a = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'string' }) },
      })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: { id: IR.SCALAR({ tsType: 'number' }) },
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('array comparison', () => {
    it('returns true for identical arrays', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different nullableElement', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: true,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different element types', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'number' }),
        nullableElement: false,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different nullable in arrays', () => {
      const a = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
        nullable: true,
      })
      const b = IR.ARRAY({
        ofType: IR.SCALAR({ tsType: 'string' }),
        nullableElement: false,
        nullable: false,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('union comparison', () => {
    it('returns true for identical unions', () => {
      const a = IR.UNION({
        types: [
          IR.SCALAR({ tsType: 'string' }),
          IR.SCALAR({ tsType: 'number' }),
        ],
      })
      const b = IR.UNION({
        types: [
          IR.SCALAR({ tsType: 'string' }),
          IR.SCALAR({ tsType: 'number' }),
        ],
      })
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different number of types', () => {
      const a = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
      })
      const b = IR.UNION({
        types: [
          IR.SCALAR({ tsType: 'string' }),
          IR.SCALAR({ tsType: 'number' }),
        ],
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different union types', () => {
      const a = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
      })
      const b = IR.UNION({
        types: [IR.SCALAR({ tsType: 'number' })],
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })

    it('returns false for different nullable in unions', () => {
      const a = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
        nullable: true,
      })
      const b = IR.UNION({
        types: [IR.SCALAR({ tsType: 'string' })],
        nullable: false,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('fragment spread comparison', () => {
    it('returns true for identical fragment spreads', () => {
      const a = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      const b = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      expect(isIdenticalIR(a, b)).toBe(true)
    })

    it('returns false for different fragment type names', () => {
      const a = IR.FRAGMENT_SPREAD({
        name: 'UserFragment',
        fragmentTypeName: 'UserFragmentType',
        fragmentTypeCondition: 'User',
        parentType: 'Query',
      })
      const b = IR.FRAGMENT_SPREAD({
        name: 'AdminFragment',
        fragmentTypeName: 'AdminFragmentType',
        fragmentTypeCondition: 'Admin',
        parentType: 'Query',
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })

  describe('cross-type comparison', () => {
    it('returns false for different IR kinds', () => {
      const scalar = IR.SCALAR({ tsType: 'string' })
      const obj = IR.OBJECT({ graphQLTypeName: 'User', fields: {} })
      expect(isIdenticalIR(scalar, obj)).toBe(false)
    })

    it('returns false when nullable differs at top level', () => {
      const a = IR.SCALAR({ tsType: 'string', nullable: true })
      const b = IR.OBJECT({
        graphQLTypeName: 'User',
        fields: {},
        nullable: false,
      })
      expect(isIdenticalIR(a, b)).toBe(false)
    })
  })
})

describe('postProcessIR', () => {
  it('returns scalar unchanged', () => {
    const scalar = IR.SCALAR({ tsType: 'string' })
    const result = postProcessIR(scalar)
    expect(result).toBe(scalar)
  })

  it('returns typename unchanged', () => {
    const typename = IR.TYPENAME(['User'])
    const result = postProcessIR(typename)
    expect(result).toBe(typename)
  })

  it('returns fragment spread unchanged', () => {
    const spread = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    const result = postProcessIR(spread)
    expect(result).toBe(spread)
  })

  it('processes object fields recursively', () => {
    const obj = IR.OBJECT({
      graphQLTypeName: 'User',
      fields: {
        nested: IR.UNION({
          types: [
            IR.OBJECT({
              graphQLTypeName: 'Profile',
              fields: { __typename: IR.TYPENAME(['Profile']) },
            }),
            IR.OBJECT({
              graphQLTypeName: 'Profile',
              fields: { __typename: IR.TYPENAME(['Profile']) },
            }),
          ],
        }),
      },
    })
    const result = postProcessIR(obj)
    expect(result.kind).toBe('OBJECT')
  })

  it('processes array element recursively', () => {
    const arr = IR.ARRAY({
      ofType: IR.SCALAR({ tsType: 'string' }),
      nullableElement: false,
    })
    const result = postProcessIR(arr)
    expect(result.kind).toBe('ARRAY')
  })

  it('merges union branches with same shape but different typename', () => {
    const union = IR.UNION({
      types: [
        IR.OBJECT({
          graphQLTypeName: 'Cat',
          fields: {
            __typename: IR.TYPENAME(['Cat']),
            name: IR.SCALAR({ tsType: 'string' }),
          },
        }),
        IR.OBJECT({
          graphQLTypeName: 'Dog',
          fields: {
            __typename: IR.TYPENAME(['Dog']),
            name: IR.SCALAR({ tsType: 'string' }),
          },
        }),
      ],
    })
    const result = postProcessIR(union)
    expect(result.kind).toBe('UNION')
    // The branches should be merged since they have the same shape except __typename
    if (result.kind === 'UNION') {
      expect(result.types.length).toBe(1)
      const merged = result.types[0] as IRNodeObject
      const typename = merged.fields.__typename as IRNodeTypename
      expect(typename.types).toContain('Cat')
      expect(typename.types).toContain('Dog')
    }
  })

  it('keeps different shaped objects separate', () => {
    const union = IR.UNION({
      types: [
        IR.OBJECT({
          graphQLTypeName: 'Cat',
          fields: {
            __typename: IR.TYPENAME(['Cat']),
            name: IR.SCALAR({ tsType: 'string' }),
          },
        }),
        IR.OBJECT({
          graphQLTypeName: 'Dog',
          fields: {
            __typename: IR.TYPENAME(['Dog']),
            breed: IR.SCALAR({ tsType: 'string' }),
          },
        }),
      ],
    })
    const result = postProcessIR(union)
    if (result.kind === 'UNION') {
      expect(result.types.length).toBe(2)
    }
  })
})

describe('hasTypenameField', () => {
  it('returns true when __typename exists', () => {
    const fields: Record<string, IRNode> = {
      __typename: IR.TYPENAME(['User']),
      id: IR.SCALAR({ tsType: 'string' }),
    }
    expect(hasTypenameField(fields)).toBe(true)
  })

  it('returns false when __typename does not exist', () => {
    const fields: Record<string, IRNode> = {
      id: IR.SCALAR({ tsType: 'string' }),
    }
    expect(hasTypenameField(fields)).toBe(false)
  })

  it('returns false for empty fields', () => {
    expect(hasTypenameField({})).toBe(false)
  })
})

describe('buildFragmentIRFields', () => {
  it('returns object fields directly', () => {
    const obj = IR.OBJECT({
      graphQLTypeName: 'User',
      fields: {
        id: IR.SCALAR({ tsType: 'string' }),
        name: IR.SCALAR({ tsType: 'string' }),
      },
    })
    const result = buildFragmentIRFields(obj)
    expect(result.id).toBeDefined()
    expect(result.name).toBeDefined()
  })

  it('merges union object branches', () => {
    const union = IR.UNION({
      types: [
        IR.OBJECT({
          graphQLTypeName: 'User',
          fields: { id: IR.SCALAR({ tsType: 'string' }) },
        }),
        IR.OBJECT({
          graphQLTypeName: 'Admin',
          fields: { role: IR.SCALAR({ tsType: 'string' }) },
        }),
      ],
    })
    const result = buildFragmentIRFields(union)
    expect(result.id).toBeDefined()
    expect(result.role).toBeDefined()
  })

  it('skips non-object branches in union', () => {
    const union = IR.UNION({
      types: [
        IR.OBJECT({
          graphQLTypeName: 'User',
          fields: { id: IR.SCALAR({ tsType: 'string' }) },
        }),
        IR.SCALAR({ tsType: 'null' }),
      ],
    })
    const result = buildFragmentIRFields(union)
    expect(result.id).toBeDefined()
  })

  it('returns empty object for scalar', () => {
    const scalar = IR.SCALAR({ tsType: 'string' })
    const result = buildFragmentIRFields(scalar)
    expect(Object.keys(result).length).toBe(0)
  })

  it('returns empty object for array', () => {
    const arr = IR.ARRAY({
      ofType: IR.SCALAR({ tsType: 'string' }),
      nullableElement: false,
    })
    const result = buildFragmentIRFields(arr)
    expect(Object.keys(result).length).toBe(0)
  })

  it('returns empty object for typename', () => {
    const typename = IR.TYPENAME(['User'])
    const result = buildFragmentIRFields(typename)
    expect(Object.keys(result).length).toBe(0)
  })

  it('returns empty object for fragment spread', () => {
    const spread = IR.FRAGMENT_SPREAD({
      name: 'UserFragment',
      fragmentTypeName: 'UserFragmentType',
      fragmentTypeCondition: 'User',
      parentType: 'Query',
    })
    const result = buildFragmentIRFields(spread)
    expect(Object.keys(result).length).toBe(0)
  })
})
