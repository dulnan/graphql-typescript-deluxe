import { describe, expect, it } from 'vitest'
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  buildClientSchema,
  buildSchema,
  introspectionFromSchema,
} from 'graphql'
import { Generator } from '../../../src/classes/Generator'
import type { GeneratorOptions } from '../../../src/types/options'
import { toDocument } from '../../helpers'

const SDL = `
enum Status {
  DRAFT
  PUBLISHED
}

input DateRange {
  from: Int!
  to: Int
}

input Filter {
  text: String
  status: [Status!]
  range: DateRange!
  children: [[Filter]]
}

type Query {
  search(filter: Filter!, limit: Int, statuses: [[Status!]]): [String]
}
`

const DOCUMENT = `
query search($filter: Filter!, $limit: Int, $statuses: [[Status!]]) {
  search(filter: $filter, limit: $limit, statuses: $statuses)
}
`

/**
 * The same schema as SDL, built code-first. Types built this way have no AST
 * nodes.
 */
function buildCodeFirstSchema(): GraphQLSchema {
  const Status = new GraphQLEnumType({
    name: 'Status',
    values: { DRAFT: {}, PUBLISHED: {} },
  })

  const DateRange = new GraphQLInputObjectType({
    name: 'DateRange',
    fields: {
      from: { type: new GraphQLNonNull(GraphQLInt) },
      to: { type: GraphQLInt },
    },
  })

  const Filter: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'Filter',
    fields: () => ({
      text: { type: GraphQLString },
      status: { type: new GraphQLList(new GraphQLNonNull(Status)) },
      range: { type: new GraphQLNonNull(DateRange) },
      children: { type: new GraphQLList(new GraphQLList(Filter)) },
    }),
  })

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        search: {
          type: new GraphQLList(GraphQLString),
          args: {
            filter: { type: new GraphQLNonNull(Filter) },
            limit: { type: GraphQLInt },
            statuses: {
              type: new GraphQLList(
                new GraphQLList(new GraphQLNonNull(Status)),
              ),
            },
          },
        },
      },
    }),
  })
}

function generate(schema: GraphQLSchema, options?: GeneratorOptions): string {
  const generator = new Generator(schema, options)
  generator.add(toDocument(DOCUMENT))
  return generator.build().getOperations('ts').getSource()
}

describe('Generator with a schema without AST nodes', () => {
  const sdlSchema = buildSchema(SDL)

  const schemas = {
    'built from an introspection result': buildClientSchema(
      introspectionFromSchema(sdlSchema),
    ),
    'built code-first': buildCodeFirstSchema(),
  }

  for (const [label, schema] of Object.entries(schemas)) {
    for (const useCache of [false, true]) {
      it(`generates the same types for a schema ${label} (useCache: ${useCache})`, () => {
        // Only SDL schemas have the source of a type, so the source comment is
        // left out.
        const options: GeneratorOptions = {
          useCache,
          output: {
            typeComment: ['typeDescription', 'fieldDescription', 'link'],
          },
        }

        const expected = generate(sdlSchema, options)
        expect(expected).toContain('export type Filter = {')
        expect(generate(schema, options)).toEqual(expected)
      })
    }

    it(`generates types with the default options for a schema ${label}`, () => {
      expect(generate(schema)).toContain('export type Filter = {')
    })
  }
})
