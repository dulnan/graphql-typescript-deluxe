import { describe, expect, it } from 'vitest'
import { stripIgnoredCharacters } from 'graphql'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { GeneratorOutputCode } from '../../../src/classes/GeneratorOutputCode'
import { generateOperationsFile } from '../../../src/helpers/output/generateOperationsFile'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator Operations File', () => {
  it('generates operations file with mutations', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        `mutation submitContactForm($input: SubmitContactForm!, $dryRun: Boolean) {
          submitForm(input: $input, dryRun: $dryRun)
        }`,
        'mutation.submit.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile()

    expect(operationsFile.getSource()).toContain('mutation: {')
    expect(operationsFile.getSource()).toContain("'submitContactForm':")
  })

  it('generates operations file with subscriptions', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        `subscription onFormSubmitted {
          formSubmitted {
            id
            timestamp
          }
        }`,
        'subscription.form.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile()

    expect(operationsFile.getSource()).toContain('subscription: {')
    expect(operationsFile.getSource()).toContain("'onFormSubmitted':")
  })

  it('generates operations file with all operation types', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        `query getHomepage { getHomepage { title } }`,
        'query.homepage.graphql',
      ),
      toDocument(
        `mutation createUser($email: String!) { createUser(email: $email) { errors } }`,
        'mutation.createUser.graphql',
      ),
      toDocument(
        `subscription onFormSubmitted { formSubmitted { id } }`,
        'subscription.form.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile()

    expect(operationsFile.getSource()).toContain("'getHomepage':")
    expect(operationsFile.getSource()).toContain("'createUser':")
    expect(operationsFile.getSource()).toContain("'onFormSubmitted':")
  })

  it('generates operations file without minification', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        'fragment simpleUser on User { id, email, name }',
        'fragment.user.graphql',
      ),
      toDocument(
        `query getUser { getRandomEntity { ...simpleUser } }`,
        'query.user.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile({ minify: false })

    // Without minification, variable names should not be minified
    expect(operationsFile.getSource()).toContain('const simpleUser')
  })

  it('generates operations file with custom export name', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    generator.add([
      toDocument(
        `query getHomepage { getHomepage { title } }`,
        'query.homepage.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile({
      exportName: 'graphqlOperations',
    })

    expect(operationsFile.getSource()).toContain(
      'export const graphqlOperations',
    )
  })

  it('handles long operation strings without minification', () => {
    const generator = new Generator(schema, {
      output: {
        typeComment: false,
      },
    })

    // Create a query with multiple fragments to generate a long operation string
    generator.add([
      toDocument(
        'fragment authorDetails on Author { name, email }',
        'fragment.author.graphql',
      ),
      toDocument(
        'fragment categoryDetails on Category { label, url }',
        'fragment.category.graphql',
      ),
      toDocument(
        'fragment articleDetails on NodeArticle { title, body, author { ...authorDetails }, categories { ...categoryDetails } }',
        'fragment.article.graphql',
      ),
      toDocument(
        `query getArticle { getRandomEntity { ...articleDetails } }`,
        'query.article.graphql',
      ),
    ])

    const result = generator.build()
    const operationsFile = result.getOperationsFile({ minify: false })

    // Long lines should be split when not minifying
    expect(operationsFile.getSource()).toBeDefined()
  })

  describe('GraphQL strings', () => {
    const fragment =
      'fragment f on Query { search(text: "${foo}") { __typename } }'
    const sources: [string, string][] = [
      ['an interpolation', 'query q { search(text: "${foo}") { __typename } }'],
      ['backticks', 'query q { search(text: "a `b` c") { __typename } }'],
      [
        'a backslash before a backtick in a block string',
        'query q { search(text: """a\\`b""") { __typename } }',
      ],
      [
        'backslashes before an interpolation in a block string',
        'query q { search(text: """a\\\\${foo}""") { __typename } }',
      ],
      ['an interpolation in a fragment', 'query q { ...f } ' + fragment],
    ]

    it.each(
      sources.flatMap(([name, source]) =>
        [true, false].map((minify) => [name, minify, source] as const),
      ),
    )('keeps %s (minify: %s)', (_, minify, source) => {
      const generator = new Generator(schema)
      generator.add(toDocument(source))
      const file = generator.build().getOperationsFile({ minify }).getSource()

      // Evaluate the file: An interpolation would throw, because foo is not
      // defined.
      const operations = new Function(
        file.replace('export const operations =', 'return'),
      )() as { query: Record<string, string> }

      const definitions = source.includes(fragment)
        ? [source.replace(fragment, '').trim(), fragment]
        : [source]
      const expected = definitions
        .map((v) => (minify ? stripIgnoredCharacters(v) : v + '\n\n'))
        .join('')
      expect(operations.query.q).toEqual(expected)
    })
  })

  describe('error handling', () => {
    it('throws NodeLocMissingError when fragment has no source', () => {
      const fragmentCode = new GeneratorOutputCode({
        id: 'fragment-1',
        type: 'fragment',
        name: 'TestFragment',
        graphqlName: 'testFragment',
        code: { ts: '', 'd.ts': '', js: '' },
        source: null, // Missing source
      })

      expect(() => generateOperationsFile([fragmentCode])).toThrow(
        'testFragment',
      )
    })

    it('throws LogicError when fragment has no graphqlName', () => {
      const fragmentCode = new GeneratorOutputCode({
        id: 'fragment-1',
        type: 'fragment',
        name: 'TestFragment',
        graphqlName: null, // Missing graphqlName
        code: { ts: '', 'd.ts': '', js: '' },
        source: 'fragment test on User { id }',
      })

      expect(() => generateOperationsFile([fragmentCode])).toThrow(
        'Missing graphqlName for fragment',
      )
    })

    it('throws NodeLocMissingError when operation has no source', () => {
      const operationCode = new GeneratorOutputCode({
        id: 'operation-1',
        type: 'operation',
        name: 'TestQuery',
        graphqlName: 'test',
        identifier: 'query',
        code: { ts: '', 'd.ts': '', js: '' },
        source: null, // Missing source
      })

      expect(() => generateOperationsFile([operationCode])).toThrow('test')
    })
  })
})
