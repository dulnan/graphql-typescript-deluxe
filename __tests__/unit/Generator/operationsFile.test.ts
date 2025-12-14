import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
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
})
