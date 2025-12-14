import { describe, expect, it } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator Operation Types', () => {
  it('generates operation types for mutations', () => {
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
    const operationTypes = result.getOperationTypesFile()

    expect(operationTypes.getSource()).toContain('export type Mutation = {')
    expect(operationTypes.getSource()).toContain('submitContactForm:')
    expect(operationTypes.getSource()).toContain(
      'response: SubmitContactFormMutation',
    )
  })

  it('generates operation types for subscriptions', () => {
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
    const operationTypes = result.getOperationTypesFile()

    expect(operationTypes.getSource()).toContain('export type Subscription = {')
    expect(operationTypes.getSource()).toContain('onFormSubmitted:')
    expect(operationTypes.getSource()).toContain(
      'response: OnFormSubmittedSubscription',
    )
  })

  it('generates operation types with import statement when importFrom is provided', () => {
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
    ])

    const result = generator.build()
    const operationTypes = result.getOperationTypesFile({
      importFrom: './types',
    })

    expect(operationTypes.getSource()).toContain('import type {')
    expect(operationTypes.getSource()).toContain("} from './types'")
    expect(operationTypes.getSource()).toContain('GetHomepageQuery')
    expect(operationTypes.getSource()).toContain('CreateUserMutation')
  })

  it('generates all operation types together', () => {
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
    const operationTypes = result.getOperationTypesFile()

    expect(operationTypes.getSource()).toMatchInlineSnapshot(`
      "export type Query = {
        getHomepage: {
          response: GetHomepageQuery,
          variables: GetHomepageQueryVariables,
          needsVariables: false
        }
      }

      export type Mutation = {
        createUser: {
          response: CreateUserMutation,
          variables: CreateUserMutationVariables,
          needsVariables: true
        }
      }

      export type Subscription = {
        onFormSubmitted: {
          response: OnFormSubmittedSubscription,
          variables: OnFormSubmittedSubscriptionVariables,
          needsVariables: false
        }
      }

      export type Operations = {
        query: Query,
        mutation: Mutation,
        subscription: Subscription,
      }"
    `)
  })

  it('returns collected operations via getCollectedOperations', () => {
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
    ])

    const result = generator.build()
    const operations = result.getCollectedOperations()

    expect(operations).toHaveLength(2)
    expect(operations.map((op) => op.graphqlName).sort()).toEqual([
      'createUser',
      'getHomepage',
    ])
  })
})
