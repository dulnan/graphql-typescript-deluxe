import { describe, expect, it } from 'vitest'
import { parse, buildSchema } from 'graphql'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'
import {
  DuplicateInputDocumentError,
  FragmentNotFoundError,
  LogicError,
  FieldNotFoundError,
} from '../../../src'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator', () => {
  // ===========================================================================
  // Constructor
  // ===========================================================================
  describe('constructor', () => {
    it('should create a generator with default options', () => {
      const generator = new Generator(schema)
      expect(generator.options).toBeDefined()
      expect(generator.options.dependencyTracking).toBe(true)
    })

    it('should create a generator with custom options', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        useCache: false,
      })
      expect(generator.options.dependencyTracking).toBe(false)
      expect(generator.options.useCache).toBe(false)
    })

    it('should accept output options', () => {
      const generator = new Generator(schema, {
        output: {
          nullableField: 'null',
          nonOptionalTypename: true,
        },
      })
      expect(generator.options.output.nullableField).toBe('null')
      expect(generator.options.output.nonOptionalTypename).toBe(true)
    })
  })

  // ===========================================================================
  // add() method
  // ===========================================================================
  describe('add', () => {
    it('should add a single document', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
    })

    it('should add multiple documents as array', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('query test1 { getHomepage { title } }', 'test1.graphql'),
        toDocument('query test2 { getHomepage { body } }', 'test2.graphql'),
      ])

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(2)
    })

    it('should accept raw GraphQL string', () => {
      const generator = new Generator(schema)
      generator.add('query test { getHomepage { title } }')

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
    })

    it('should accept DocumentNode directly', () => {
      const generator = new Generator(schema)
      const doc = parse('query test { getHomepage { title } }')
      generator.add(doc)

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
    })

    it('should throw DuplicateInputDocumentError when adding duplicate file path', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'same.graphql'),
      )

      expect(() =>
        generator.add(
          toDocument('query test2 { getHomepage { body } }', 'same.graphql'),
        ),
      ).toThrow(DuplicateInputDocumentError)
    })

    it('should return generator for chaining', () => {
      const generator = new Generator(schema)
      const result = generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      expect(result).toBe(generator)
    })
  })

  // ===========================================================================
  // hasFilePath() method
  // ===========================================================================
  describe('hasFilePath', () => {
    it('should return true for existing file path', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      expect(generator.hasFilePath('test.graphql')).toBe(true)
    })

    it('should return false for non-existing file path', () => {
      const generator = new Generator(schema)
      expect(generator.hasFilePath('nonexistent.graphql')).toBe(false)
    })
  })

  // ===========================================================================
  // update() method
  // ===========================================================================
  describe('update', () => {
    it('should update an existing document', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })

      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      let result = generator.build()
      expect(result.getOperations('ts').getSource()).toContain('title')
      expect(result.getOperations('ts').getSource()).not.toContain('body')

      generator.update(
        toDocument('query test { getHomepage { body } }', 'test.graphql'),
      )

      result = generator.build()
      expect(result.getOperations('ts').getSource()).toContain('body')
      expect(result.getOperations('ts').getSource()).not.toContain('title')
    })

    it('should throw LogicError when updating non-existing document', () => {
      const generator = new Generator(schema)

      expect(() =>
        generator.update(
          toDocument(
            'query test { getHomepage { title } }',
            'nonexistent.graphql',
          ),
        ),
      ).toThrow(LogicError)
    })

    it('should return generator for chaining', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      const result = generator.update(
        toDocument('query test { getHomepage { body } }', 'test.graphql'),
      )
      expect(result).toBe(generator)
    })
  })

  // ===========================================================================
  // remove() method
  // ===========================================================================
  describe('remove', () => {
    it('should remove a document by file path', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument('query test1 { getHomepage { title } }', 'test1.graphql'),
        toDocument('query test2 { getHomepage { body } }', 'test2.graphql'),
      ])

      generator.remove('test1.graphql')

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
      expect(result.getCollectedOperations()[0]!.graphqlName).toBe('test2')
    })

    it('should return generator for chaining', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      const result = generator.remove('test.graphql')
      expect(result).toBe(generator)
    })
  })

  // ===========================================================================
  // reset() and resetCaches() methods
  // ===========================================================================
  describe('reset', () => {
    it('should clear all documents and caches', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      generator.build()

      generator.reset()

      expect(generator.hasFilePath('test.graphql')).toBe(false)
      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(0)
    })
  })

  describe('resetCaches', () => {
    it('should clear caches but keep documents', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      generator.build()

      generator.resetCaches()

      expect(generator.hasFilePath('test.graphql')).toBe(true)
      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
    })

    it('should return generator for chaining', () => {
      const generator = new Generator(schema)
      const result = generator.resetCaches()
      expect(result).toBe(generator)
    })
  })

  // ===========================================================================
  // updateSchema() method
  // ===========================================================================
  describe('updateSchema', () => {
    it('should update the schema and reset state', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      generator.build()

      const newSchema = buildSchema(`
        type Query {
          hello: String
        }
      `)

      generator.updateSchema(newSchema)

      expect(generator.hasFilePath('test.graphql')).toBe(false)
    })

    it('should return generator for chaining', () => {
      const generator = new Generator(schema)
      const result = generator.updateSchema(schema)
      expect(result).toBe(generator)
    })
  })

  // ===========================================================================
  // build() method
  // ===========================================================================
  describe('build', () => {
    it('should generate types for queries', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          'query getPage { getHomepage { title, body } }',
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('GetPageQuery')
      expect(source).toContain('title')
      expect(source).toContain('body')
    })

    it('should generate types for mutations', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `mutation createNewUser($email: String!) {
            createUser(email: $email) { errors }
          }`,
          'mutation.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('CreateNewUserMutation')
      expect(source).toContain('CreateNewUserMutationVariables')
    })

    it('should generate types for subscriptions', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `subscription onForm {
            formSubmitted { id, timestamp }
          }`,
          'subscription.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('OnFormSubscription')
    })

    it('should generate fragment types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title, body }',
          'fragment.graphql',
        ),
        toDocument(
          'query getPage { getHomepage { ...pageFields } }',
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('PageFieldsFragment')
    })

    it('should generate enum types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          'query getEntity { getRandomEntity { entityType } }',
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('EntityType')
    })

    it('should handle inline fragments', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query getEntity {
            getRandomEntity {
              id
              ... on NodePage { title, body }
              ... on NodeArticle { title, tags }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('GetEntityQuery')
      expect(source).toContain('body')
      expect(source).toContain('tags')
    })

    it('should handle variables', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query searchContent($text: String, $bundle: String!, $bundleRequired: String!) {
            searchContent(text: $text, bundle: $bundle, bundleRequired: $bundleRequired) {
              title
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SearchContentQueryVariables')
      expect(source).toContain('text?:')
      expect(source).toContain('bundle:')
      expect(source).toContain('bundleRequired:')
    })

    it('should handle input types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `mutation submit($input: SubmitContactForm!) {
            submitForm(input: $input)
          }`,
          'mutation.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SubmitContactForm')
      expect(source).toContain('firstName:')
      expect(source).toContain('lastName:')
    })

    it('should build multiple times with same result', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      const result1 = generator.build().getOperations('ts').getSource()
      const result2 = generator.build().getOperations('ts').getSource()

      expect(result1).toBe(result2)
    })
  })

  // ===========================================================================
  // Error handling
  // ===========================================================================
  describe('error handling', () => {
    it('should throw FragmentNotFoundError for missing fragment', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument(
          'query test { getHomepage { ...nonExistentFragment } }',
          'test.graphql',
        ),
      )

      expect(() => generator.build()).toThrow(FragmentNotFoundError)
    })

    it('should throw FieldNotFoundError for non-existing field', () => {
      const generator = new Generator(schema)
      generator.add(
        toDocument(
          'query test { getHomepage { nonExistentField } }',
          'test.graphql',
        ),
      )

      expect(() => generator.build()).toThrow(FieldNotFoundError)
    })
  })

  // ===========================================================================
  // Caching behavior
  // ===========================================================================
  describe('caching', () => {
    it('should produce same output with cache enabled and disabled', () => {
      const generatorWithCache = new Generator(schema, {
        useCache: true,
        output: { typeComment: false },
      })
      const generatorWithoutCache = new Generator(schema, {
        useCache: false,
        output: { typeComment: false },
      })

      const docs = [
        toDocument(
          'fragment page on NodePage { title, body }',
          'fragment.graphql',
        ),
        toDocument('query test { getHomepage { ...page } }', 'query.graphql'),
      ]

      generatorWithCache.add(docs)
      generatorWithoutCache.add(docs)

      const resultWithCache = generatorWithCache
        .build()
        .getOperations('ts')
        .getSource()
      const resultWithoutCache = generatorWithoutCache
        .build()
        .getOperations('ts')
        .getSource()

      expect(resultWithCache).toBe(resultWithoutCache)
    })
  })

  // ===========================================================================
  // Output options
  // ===========================================================================
  describe('output options', () => {
    it('should use optional fields for nullable by default', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          'query test { getHomepage { title, body } }',
          'test.graphql',
        ),
      )

      const source = generator.build().getOperations('ts').getSource()

      // body is nullable, should be optional
      expect(source).toContain('body?:')
    })

    it('should use null union when nullableField is "null"', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          nullableField: 'null',
        },
      })
      generator.add(
        toDocument(
          'query test { getHomepage { title, body } }',
          'test.graphql',
        ),
      )

      const source = generator.build().getOperations('ts').getSource()

      expect(source).toContain('body:')
      expect(source).toContain('| null')
    })

    it('should use Maybe type when nullableField is "maybe"', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          nullableField: 'maybe',
        },
      })
      generator.add(
        toDocument(
          'query test { getHomepage { title, body } }',
          'test.graphql',
        ),
      )

      const source = generator.build().getOperations('ts').getSource()

      expect(source).toContain('Maybe<')
    })

    it('should include type comments when enabled', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: true,
        },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      const source = generator.build().getOperations('ts').getSource()

      expect(source).toContain('@see')
    })

    it('should exclude type comments when disabled', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
        },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      const source = generator.build().getOperations('ts').getSource()

      expect(source).not.toContain('@see')
    })
  })

  // ===========================================================================
  // skipUnusedFragments option
  // ===========================================================================
  describe('skipUnusedFragments', () => {
    it('should include unused fragments when skipUnusedFragments is false', () => {
      const generator = new Generator(schema, {
        skipUnusedFragments: false,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment unused on User { email }', 'fragment.graphql'),
        toDocument('query test { getHomepage { title } }', 'query.graphql'),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('UnusedFragment')
    })

    it('should skip unused fragments when skipUnusedFragments is true', () => {
      const generator = new Generator(schema, {
        skipUnusedFragments: true,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment unused on User { email }', 'fragment.graphql'),
        toDocument('query test { getHomepage { title } }', 'query.graphql'),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).not.toContain('UnusedFragment')
    })
  })

  // ===========================================================================
  // generateOnce static method
  // ===========================================================================
  describe('generateOnce', () => {
    it('should generate types in a single call', () => {
      const result = Generator.generateOnce(
        schema,
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      expect(result).toContain('TestQuery')
    })

    it('should accept multiple documents', () => {
      const result = Generator.generateOnce(schema, [
        toDocument('query test1 { getHomepage { title } }', 'test1.graphql'),
        toDocument('query test2 { getHomepage { body } }', 'test2.graphql'),
      ])

      expect(result).toContain('Test1Query')
      expect(result).toContain('Test2Query')
    })

    it('should accept options', () => {
      const result = Generator.generateOnce(
        schema,
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
        { output: { typeComment: false } },
      )

      expect(result).not.toContain('@see')
    })
  })

  // ===========================================================================
  // Dependency tracking
  // ===========================================================================
  describe('dependency tracking', () => {
    it('should track fragment dependencies', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment author on Author { name }', 'author.graphql'),
        toDocument(
          'fragment article on NodeArticle { author { ...author } }',
          'article.graphql',
        ),
        toDocument(
          'query test { getRandomEntity { ...article } }',
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const fragments = result.getFragments()
      const articleFragment = fragments.find(
        (f) => f.node.name.value === 'article',
      )

      expect(articleFragment).toBeDefined()
      expect(articleFragment!.getGraphQLFragmentDependencies()).toContain(
        'author',
      )
    })

    it('should work without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )

      const result = generator.build()
      expect(result.getCollectedOperations()).toHaveLength(1)
    })
  })

  // ===========================================================================
  // Complex scenarios
  // ===========================================================================
  describe('complex scenarios', () => {
    it('should handle nested fragments', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment entity on Entity { id }', 'entity.graphql'),
        toDocument(
          'fragment category on Category { label, related { ...entity } }',
          'category.graphql',
        ),
        toDocument(
          'fragment article on NodeArticle { categories { ...category } }',
          'article.graphql',
        ),
        toDocument(
          'query test { getRandomEntity { ...article } }',
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('EntityFragment')
      expect(source).toContain('CategoryFragment')
      expect(source).toContain('ArticleFragment')
    })

    it('should handle union types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query search {
            search(text: "test") {
              ... on MediaVideo { videoUrl }
              ... on NodeArticle { title }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('videoUrl')
      expect(source).toContain('title')
    })

    it('should handle interface types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query getEntity {
            getRandomEntity {
              ... on Node { title }
              ... on Media { provider }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('title')
      expect(source).toContain('provider')
    })

    it('should handle aliases', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            homepage: getHomepage { pageTitle: title }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('homepage')
      expect(source).toContain('pageTitle')
    })

    it('should handle __typename field', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              __typename
              id
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('__typename')
    })

    it('should handle deprecated fields', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getHomepage {
              deprecatedTitle
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('deprecatedTitle')
    })
  })

  // ===========================================================================
  // Dependency Tracking Disabled
  // ===========================================================================
  describe('with dependencyTracking disabled', () => {
    it('should generate types without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `query getHomepageNoTracking {
            getHomepage {
              id
              title
              body
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('GetHomepageNoTrackingQuery')
      expect(source).toContain('id')
      expect(source).toContain('title')
      expect(source).toContain('body')
    })

    it('should handle fragments without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `fragment pageFields on NodePage {
            title
            body
          }

          query getPage {
            getHomepage {
              ...pageFields
            }
          }`,
          'page.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('PageFieldsFragment')
      expect(source).toContain('GetPageQuery')
    })

    it('should handle multiple files without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `fragment sharedPageFields on NodePage {
            id
            title
          }`,
          'fragments.graphql',
        ),
      )

      generator.add(
        toDocument(
          `query listPages {
            getHomepage {
              ...sharedPageFields
              body
            }
          }`,
          'queries.graphql',
        ),
      )

      const result = generator.build()
      expect(result.getOperations('ts').getSource()).toContain('ListPagesQuery')
      expect(result.getFragments().length).toBeGreaterThan(0)
    })

    it('should handle caching without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        useCache: true,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `query first {
            getHomepage { title }
          }`,
          'first.graphql',
        ),
      )

      generator.add(
        toDocument(
          `query second {
            getHomepage { title }
          }`,
          'second.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('FirstQuery')
      expect(source).toContain('SecondQuery')
    })

    it('should handle enums and input types without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `mutation submitContactForm($input: SubmitContactForm!) {
            submitForm(input: $input)
          }`,
          'mutation.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SubmitContactFormMutation')
      expect(source).toContain('SubmitContactForm')
    })

    it('should handle unions and interfaces without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `query searchContent {
            search(text: "test") {
              ... on MediaVideo { videoUrl }
              ... on NodeArticle { title }
            }
            getRandomEntity {
              ... on Node { title }
              ... on Media { provider }
            }
          }`,
          'search.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SearchContentQuery')
      expect(source).toContain('videoUrl')
      expect(source).toContain('title')
    })

    it('should handle generateOnce without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(`query q1 { getHomepage { title } }`, 'q1.graphql'),
      )

      const result1 = generator.build()

      generator.add(
        toDocument(`query q2 { getHomepage { title } }`, 'q2.graphql'),
      )

      const result2 = generator.build()

      // Both should work without dependency tracking
      expect(result1.getOperations('ts').getSource()).toContain('Q1Query')
      expect(result2.getOperations('ts').getSource()).toContain('Q2Query')
    })

    it('should handle nested fragments without dependency tracking', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })

      generator.add(
        toDocument(
          `fragment innerPageFields on NodePage {
            id
          }

          fragment outerPageFields on NodePage {
            ...innerPageFields
            title
          }

          query getPageNested {
            getHomepage {
              ...outerPageFields
            }
          }`,
          'nested.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('InnerPageFieldsFragment')
      expect(source).toContain('OuterPageFieldsFragment')
      expect(source).toContain('GetPageNestedQuery')
    })
  })
})
