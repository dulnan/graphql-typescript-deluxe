import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { parse } from 'graphql'
import type { GeneratorInput } from '../../../src/types'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

function toDocument(content: string, filePath: string): GeneratorInput {
  const documentNode = parse(content, {
    noLocation: false,
  })
  return {
    documentNode,
    filePath,
  }
}

function testDirective(nullableField: 'null' | 'optional' | 'maybe') {
  const generator = new Generator(schema, {
    output: {
      typeComment: false,
      nullableField,
    },
  })

  const documents = [
    toDocument(
      'query user($skip: Boolean) { getRandomEntity { ... on User { email @skip(if: $skip) id @skip(if: $skip) } } }',
      'query.user.graphql',
    ),
  ]

  const result = generator.add(documents).build()
  return (
    result.getGeneratedCode().find((v) => v.type === 'operation')?.code || ''
  )
}

function testNullable(nullableField: 'null' | 'optional' | 'maybe') {
  const generator = new Generator(schema, {
    output: {
      typeComment: false,
      nullableField,
    },
  })

  const documents = [
    toDocument('fragment user on User { email id }', 'fragment.user.graphql'),
  ]

  const result = generator.add(documents).build()
  return result.getGeneratedCode().find((v) => v.type === 'fragment')?.code
}

describe('Generator nullableField options', () => {
  it('Outputs the Maybe helper', async () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
        nullableField: 'maybe',
      },
    })

    const documents = [
      toDocument('fragment user on User { email }', 'fragment.user.graphql'),
    ]

    const result = generator.add(documents).build()
    expect(
      result
        .getGeneratedCode()
        .find((v) => v.type === 'type-helpers' && v.name === 'Maybe')?.code,
    ).toMatchInlineSnapshot(`"type Maybe<T> = T | null;"`)
  })

  it('Generates "Maybe<string>"', async () => {
    expect(testNullable('maybe')).toMatchInlineSnapshot(`
      "export type UserFragment = {
        email: Maybe<string>;
        id: string;
      };"
    `)
  })

  it('Generates "string | null"', async () => {
    expect(testNullable('null')).toMatchInlineSnapshot(`
      "export type UserFragment = {
        email: string | null;
        id: string;
      };"
    `)
  })

  it('Generates "?: string"', async () => {
    expect(testNullable('optional')).toMatchInlineSnapshot(`
      "export type UserFragment = {
        email?: string;
        id: string;
      };"
    `)
  })

  it('Generates "?: Maybe<string>" with skip directive', async () => {
    expect(testDirective('maybe')).toMatchInlineSnapshot(`
      "export type UserQuery = {
        getRandomEntity: Maybe<(object | {
          email?: Maybe<string>;
          id?: string;
        })>;
      };"
    `)
  })

  it('Generates "?: string | null" with skip directive', async () => {
    expect(testDirective('null')).toMatchInlineSnapshot(`
      "export type UserQuery = {
        getRandomEntity: (object | {
          email?: string | null;
          id?: string;
        }) | null;
      };"
    `)
  })

  it('Generates "?: string" with skip directive', async () => {
    expect(testDirective('optional')).toMatchInlineSnapshot(`
      "export type UserQuery = {
        getRandomEntity?: (object | {
          email?: string;
          id?: string;
        });
      };"
    `)
  })
})
