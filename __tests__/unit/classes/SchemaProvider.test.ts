import { describe, it, expect, beforeEach } from 'vitest'
import { loadSchemaSync } from '@graphql-tools/load'
import {
  GraphQLSchema,
  parse,
  type OperationDefinitionNode,
  GraphQLInterfaceType,
  GraphQLUnionType,
} from 'graphql'
import { SchemaProvider } from '../../../src/classes/SchemaProvider'
import { TypeNotFoundError } from '../../../src/errors'

describe('SchemaProvider', () => {
  // Define a test schema that includes interfaces, unions, and object types
  const testSchemaSDL = `
    type Query {
      user: User
      search: SearchResult
    }

    type Mutation {
      createUser: User
    }

    type Subscription {
      userCreated: User
    }

    interface Node {
      id: ID!
    }

    interface User {
      id: ID!
      name: String!
    }

    type Admin implements User & Node {
      id: ID!
      name: String!
      permissions: [String!]!
    }

    type Customer implements User & Node {
      id: ID!
      name: String!
      orders: [String!]!
    }

    union SearchResult = Admin | Customer | Post

    type Post implements Node {
      id: ID!
      title: String!
      content: String!
    }
  `

  let schema: GraphQLSchema
  let schemaProvider: SchemaProvider

  // Helper function to create an operation definition node
  const createOperationNode = (
    operation: 'query' | 'mutation' | 'subscription',
  ): OperationDefinitionNode => {
    const document = parse(`${operation} { field }`)
    return document.definitions[0] as OperationDefinitionNode
  }

  beforeEach(() => {
    // Load the schema before each test
    schema = loadSchemaSync(testSchemaSDL, {
      loaders: [],
    })
    schemaProvider = new SchemaProvider(schema)
  })

  describe('constructor', () => {
    it('should initialize with a schema and build the cache', () => {
      expect(schemaProvider).toBeDefined()

      // Check if private cache is populated (indirectly through public methods)
      const adminImplementsUser = schemaProvider.objectImplements(
        'Admin',
        'User',
      )
      expect(adminImplementsUser).toBe(true)

      const possibleUserTypes =
        schemaProvider.getPossibleObjectTypeNames('User')
      expect(possibleUserTypes.length).toBe(2)
    })
  })

  describe('update', () => {
    it('should update the schema and rebuild the cache', () => {
      const updatedSchemaSDL = `
        type Query {
          post: Post
        }

        interface Node {
          id: ID!
        }

        type Post implements Node {
          id: ID!
          title: String!
        }
      `

      const updatedSchema = loadSchemaSync(updatedSchemaSDL, {
        loaders: [],
      })

      const result = schemaProvider.update(updatedSchema)

      // Should return itself for chaining
      expect(result).toBe(schemaProvider)

      // Check if cache is updated correctly
      expect(schemaProvider.objectImplements('Post', 'Node')).toBe(true)
      expect(schemaProvider.objectImplements('Admin', 'User')).toBe(false) // Old relationship should be gone

      // Check if type map is updated
      const possibleNodeTypes =
        schemaProvider.getPossibleObjectTypeNames('Node')
      expect(possibleNodeTypes.length).toBe(1)
      expect(possibleNodeTypes).toContain('Post')
      expect(possibleNodeTypes).not.toContain('Admin')
    })
  })

  describe('getRootType', () => {
    it('should return the query type for a query operation', () => {
      const queryNode = createOperationNode('query')
      const rootType = schemaProvider.getRootType(queryNode)

      expect(rootType).toBeDefined()
      expect(rootType?.name).toBe('Query')
    })

    it('should return the mutation type for a mutation operation', () => {
      const mutationNode = createOperationNode('mutation')
      const rootType = schemaProvider.getRootType(mutationNode)

      expect(rootType).toBeDefined()
      expect(rootType?.name).toBe('Mutation')
    })

    it('should return the subscription type for a subscription operation', () => {
      const subscriptionNode = createOperationNode('subscription')
      const rootType = schemaProvider.getRootType(subscriptionNode)

      expect(rootType).toBeDefined()
      expect(rootType?.name).toBe('Subscription')
    })

    it('should return null for an unknown operation type', () => {
      // Testing the default case by manipulating the operation type
      const unknownNode = createOperationNode('query')
      ;(unknownNode as any).operation = 'unknown'

      const rootType = schemaProvider.getRootType(unknownNode)
      expect(rootType).toBeNull()
    })
  })

  describe('getType', () => {
    it('should return a type by name', () => {
      const type = schemaProvider.getType('User')

      expect(type).toBeDefined()
      expect(type.name).toBe('User')
      expect(type instanceof GraphQLInterfaceType).toBe(true)
    })

    it('should throw TypeNotFoundError for non-existent type', () => {
      expect(() => schemaProvider.getType('NonExistentType')).toThrow(
        TypeNotFoundError,
      )
    })
  })

  describe('getPossibleObjectTypeNames', () => {
    it('should return all possible object type names for an interface', () => {
      const possibleTypes = schemaProvider.getPossibleObjectTypeNames('User')

      expect(possibleTypes.length).toBe(2)
      expect(possibleTypes).toContain('Admin')
      expect(possibleTypes).toContain('Customer')
    })

    it('should return all possible object type names for a union', () => {
      const possibleTypes =
        schemaProvider.getPossibleObjectTypeNames('SearchResult')

      expect(possibleTypes.length).toBe(3)
      expect(possibleTypes).toContain('Admin')
      expect(possibleTypes).toContain('Customer')
      expect(possibleTypes).toContain('Post')
    })

    it('should return an empty array for a non-abstract type', () => {
      const possibleTypes = schemaProvider.getPossibleObjectTypeNames('Post')

      expect(possibleTypes.length).toBe(0)
    })

    it('should return an empty array for a non-existent type', () => {
      const possibleTypes =
        schemaProvider.getPossibleObjectTypeNames('NonExistentType')

      expect(possibleTypes.length).toBe(0)
    })
  })

  describe('getPossibleTypes', () => {
    it('should return all possible types for an interface', () => {
      const userInterface = schema.getType('User') as GraphQLInterfaceType
      const possibleTypes = schemaProvider.getPossibleTypes(userInterface)

      expect(possibleTypes.length).toBe(2)
      expect(possibleTypes.map((t) => t.name)).toContain('Admin')
      expect(possibleTypes.map((t) => t.name)).toContain('Customer')
    })

    it('should return all possible types for a union', () => {
      const searchUnion = schema.getType('SearchResult') as GraphQLUnionType
      const possibleTypes = schemaProvider.getPossibleTypes(searchUnion)

      expect(possibleTypes.length).toBe(3)
      expect(possibleTypes.map((t) => t.name)).toContain('Admin')
      expect(possibleTypes.map((t) => t.name)).toContain('Customer')
      expect(possibleTypes.map((t) => t.name)).toContain('Post')
    })
  })

  describe('objectImplements', () => {
    it('should return true when object implements the interface', () => {
      expect(schemaProvider.objectImplements('Admin', 'User')).toBe(true)
      expect(schemaProvider.objectImplements('Customer', 'User')).toBe(true)
      expect(schemaProvider.objectImplements('Admin', 'Node')).toBe(true)
    })

    it('should return true when object is part of the union', () => {
      expect(schemaProvider.objectImplements('Admin', 'SearchResult')).toBe(
        true,
      )
      expect(schemaProvider.objectImplements('Post', 'SearchResult')).toBe(true)
    })

    it('should return false when object does not implement the interface', () => {
      expect(schemaProvider.objectImplements('Post', 'User')).toBe(false)
    })

    it('should return false when type names do not exist', () => {
      expect(schemaProvider.objectImplements('NonExistentType', 'User')).toBe(
        false,
      )
      expect(schemaProvider.objectImplements('Admin', 'NonExistentType')).toBe(
        false,
      )
    })
  })
})
