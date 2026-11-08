import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { buildSchema, parse } from 'graphql'
import {
  DuplicateDefinitionError,
  DuplicateIdentifierError,
  DuplicateInputDocumentError,
  FragmentCycleError,
  FieldNotFoundError,
  FragmentNotFoundError,
  InvalidOptionError,
  MissingRootTypeError,
  TypeNotFoundError,
  DependencyTrackingError,
  NodeLocMissingError,
} from '../../../src'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator errors', () => {
  it('Throws an InvalidOptionError', async () => {
    expect(
      () =>
        new Generator(schema, {
          output: {
            typeComment: false,
            arrayShape: 'Foobar',
          },
        }),
    ).toThrow(InvalidOptionError)
  })

  it('Throws a TypeNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on NonExistingType {
      foobar
   }
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(TypeNotFoundError)
  })

  it('Throws a FragmentNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ...nonExistingFragment
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(FragmentNotFoundError)
  })

  it('Throws a FieldNotFoundError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      nonExistinfField
    }
  }
}
`)

    generator.add(doc)

    expect(() => generator.build()).toThrow(FieldNotFoundError)
  })

  it('Throws a MissingRootTypeError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      nonExistinfField
    }
  }
}
`)

    // @ts-expect-error It's readonly.
    doc.documentNode.definitions[0].operation = 'nonExistingOperation'

    generator.add(doc)

    expect(() => generator.build()).toThrow(MissingRootTypeError)
  })

  it('Throws a DuplicateInputDocumentError', async () => {
    const generator = new Generator(schema)

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}
`)

    // Add the document initially.
    generator.add(doc)
    generator.build()

    // Try to add the same document again.
    expect(() => generator.add(doc)).toThrow(DuplicateInputDocumentError)
  })

  it('Throws a DependencyTrackingError', async () => {
    const generator = new Generator(schema)

    // Start a dependency tracking stack.
    // @ts-expect-error Private property.
    generator.dependencyTracker.start()

    const doc = toDocument(`
query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}
`)

    generator.add(doc)

    // Will throw this error since we didn't end the dependency tracker stack.
    expect(() => generator.build()).toThrow(DependencyTrackingError)
  })

  it('Throws a NodeLocMissingError', async () => {
    const generator = new Generator(schema)

    const documentNode = parse(
      `query foobar {
  getRandomEntity {
    ... on User {
      id
    }
  }
}`,
      {
        noLocation: true,
      },
    )

    generator.add({ documentNode, filePath: 'test.graphql' })
    const result = generator.build()

    expect(() => result.getOperationsFile()).toThrow(NodeLocMissingError)
  })

  describe('DuplicateDefinitionError', () => {
    const query = `query foobar { entityById(id: "1", entityType: NODE) { ...page } }`

    it('throws for a fragment name defined in two files', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument('fragment page on NodePage { title }', 'b.graphql'),
        toDocument(query, 'query.graphql'),
      ])

      expect(() => generator.build()).toThrow(
        'The fragment name "page" is defined twice in "a.graphql" and "b.graphql"',
      )
      expect(() => generator.build()).toThrow(DuplicateDefinitionError)
    })

    it('throws for an operation name defined in two files', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('query foobar { isAvailable }', 'a.graphql'),
        toDocument('mutation foobar { __typename }', 'b.graphql'),
      ])

      expect(() => generator.build()).toThrow(
        'The operation name "foobar" is defined twice in "a.graphql" and "b.graphql"',
      )
    })

    it('throws for an operation name defined twice in the same file', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query foobar { isAvailable } query foobar { isAvailable }'),
      )

      expect(() => generator.build()).toThrow(
        'The operation name "foobar" is defined twice in "test.graphql"',
      )
    })

    it('throws when a file with the same name is added later', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      generator.build()

      generator.add(toDocument('fragment page on NodePage { id }', 'b.graphql'))
      expect(() => generator.build()).toThrow(DuplicateDefinitionError)

      generator.remove('b.graphql')
      expect(generator.build().getCollectedOperations()).toHaveLength(1)
    })

    it('does not throw while a fragment is moved to another file', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment page on NodePage { title }', 'a.graphql'),
        toDocument('fragment other on NodePage { id }', 'b.graphql'),
        toDocument(query, 'query.graphql'),
      ])
      generator.build()

      // Both files are updated before the next build.
      generator.update(
        toDocument('fragment page on NodePage { title }', 'b.graphql'),
      )
      generator.update(
        toDocument('fragment other on NodePage { id }', 'a.graphql'),
      )

      const fragment = generator
        .build()
        .getFragments()
        .find((v) => v.node.name.value === 'page')
      expect(fragment?.filePath).toBe('b.graphql')
    })
  })

  describe('FragmentCycleError', () => {
    it.each([
      [
        'a fragment that spreads itself',
        'fragment a on NodePage { title ...a }',
        'a -> a',
      ],
      [
        'two fragments that spread each other',
        'fragment a on NodePage { title ...b } fragment b on NodePage { ...a }',
        'a -> b -> a',
      ],
      [
        'a cycle in an inline fragment on an abstract type',
        'fragment a on Entity { id ... on NodePage { ...a } }',
        'a -> a',
      ],
      [
        'a cycle on the root type',
        'fragment a on Query { isAvailable ...b } fragment b on Query { ...a }',
        'a -> b -> a',
      ],
      [
        'a conditional spread',
        'fragment a on NodePage { title ...a @include(if: true) }',
        'a -> a',
      ],
    ])('throws for %s', (_, content, cycle) => {
      for (const useCache of [true, false]) {
        const generator = new Generator(schema, { useCache })
        generator.add(toDocument(content))
        expect(() => generator.build()).toThrow(
          `The fragment "a" spreads itself: ${cycle}`,
        )
      }
    })

    it('throws when the fragment is first used in an operation', () => {
      const generator = new Generator(schema, { skipUnusedFragments: true })
      generator.add(
        toDocument(`
fragment a on NodePage { title ...b }
fragment b on NodePage { ...c }
fragment c on NodePage { ...a }
query foobar { entityById(id: "1", entityType: NODE) { ...b } }
`),
      )

      expect(() => generator.build()).toThrow(FragmentCycleError)
      expect(() => generator.build()).toThrow('b -> c -> a -> b')
    })

    it('builds again once the cycle is removed', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('fragment a on NodePage { title ...b }', 'a.graphql'),
        toDocument('fragment b on NodePage { ...a }', 'b.graphql'),
      ])
      expect(() => generator.build()).toThrow(FragmentCycleError)

      generator.update(toDocument('fragment b on NodePage { id }', 'b.graphql'))
      expect(generator.build().getFragments()).toHaveLength(2)
    })
  })

  describe('DuplicateIdentifierError', () => {
    const hint =
      ' Rename one of them, or change its generated name with the option in parentheses.'

    it.each([
      [
        'an input type and a query',
        'input SearchQuery { text: String } type Query { search(q: SearchQuery): String }',
        'query search($q: SearchQuery) { search(q: $q) }',
        'The generated name "SearchQuery" is used twice: by the query "search" (buildOperationTypeName) and by the input type "SearchQuery" (buildInputTypeName).' +
          hint,
      ],
      [
        'an object type and a mutation',
        'type CreateUserMutation { ok: Boolean } type Mutation { createUser: CreateUserMutation } type Query { a: String }',
        'mutation createUser { createUser { __typename ok } }',
        'The generated name "CreateUserMutation" is used twice: by the object type "CreateUserMutation" and by the mutation "createUser" (buildOperationTypeName).' +
          hint,
      ],
      [
        'an enum and an object type',
        'enum user_status { ACTIVE } type UserStatus { s: user_status } type Query { u: UserStatus }',
        'query q { u { __typename s } }',
        'The generated name "UserStatus" is used twice: by the object type "UserStatus" and by the enum "user_status" (buildEnumTypeName).' +
          hint,
      ],
      [
        'two fragments',
        'type User { id: ID } type Query { u: User }',
        'fragment user_info on User { id } fragment userInfo on User { id } query q { u { ...user_info ...userInfo } }',
        'The generated name "UserInfoFragment" is used twice: by the fragment "user_info" (buildFragmentTypeName) and by the fragment "userInfo" (buildFragmentTypeName).' +
          hint,
      ],
      [
        'an input type and the variables of a query',
        'input QQueryVariables { a: String } type Query { u(a: QQueryVariables): String }',
        'query q($a: QQueryVariables) { u(a: $a) }',
        'The generated name "QQueryVariables" is used twice: by the input type "QQueryVariables" (buildInputTypeName) and by the variables of the query "q" (buildOperationVariablesTypeName).' +
          hint,
      ],
      [
        'an interface and a fragment',
        'interface UserFragment { id: ID } type User implements UserFragment { id: ID } type Query { u: UserFragment }',
        'fragment user on User { id } query q { u { __typename ...user } }',
        'The generated name "UserFragment" is used twice: by the fragment "user" (buildFragmentTypeName) and by the interface "UserFragment".' +
          hint,
      ],
    ])('throws for %s', (_, sdl, content, message) => {
      const generator = new Generator(buildSchema(sdl))
      generator.add(toDocument(content))
      expect(() => generator.build()).toThrow(DuplicateIdentifierError)
      expect(() => generator.build()).toThrow(message)
    })

    it('does not throw once one of the names is changed with an option', () => {
      const generator = new Generator(
        buildSchema(
          'input SearchQuery { text: String } type Query { search(q: SearchQuery): String }',
        ),
        { buildInputTypeName: (type): string => type.name + 'Input' },
      )
      generator.add(
        toDocument('query search($q: SearchQuery) { search(q: $q) }'),
      )
      expect(generator.build().getOperations('ts').getSource()).toContain(
        'export type SearchQueryInput = {',
      )
    })

    it('does not throw for an unused fragment with skipUnusedFragments', () => {
      const generator = new Generator(
        buildSchema('type User { id: ID } type Query { u: User }'),
        { skipUnusedFragments: true },
      )
      generator.add(
        toDocument(
          'fragment user_info on User { id } fragment userInfo on User { id } query q { u { ...userInfo } }',
        ),
      )
      expect(generator.build().getCollectedOperations()).toHaveLength(1)
    })

    it('builds again once one of the definitions is removed', () => {
      const generator = new Generator(
        buildSchema('type User { id: ID } type Query { u: User }'),
      )
      generator.add([
        toDocument('fragment user_info on User { id }', 'a.graphql'),
        toDocument('fragment userInfo on User { id }', 'b.graphql'),
        toDocument('query q { u { ...userInfo } }', 'query.graphql'),
      ])
      expect(() => generator.build()).toThrow(DuplicateIdentifierError)

      generator.remove('a.graphql')
      expect(generator.build().getCollectedOperations()).toHaveLength(1)
    })
  })
})
