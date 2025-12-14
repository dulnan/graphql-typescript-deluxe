import { describe, expect, it, vi } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { buildSchema } from 'graphql'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

// Schema with custom scalar for testing
const schemaWithCustomScalar = buildSchema(`
  scalar DateTime

  type Query {
    now: DateTime
    created: DateTime!
  }
`)

// Schema with interface that has no implementing types initially
const schemaWithEmptyInterface = buildSchema(`
  interface EmptyInterface {
    id: ID!
  }

  type Query {
    getEmpty: EmptyInterface
  }
`)

// Schema with interface that has exactly one implementing type
const schemaWithSingleImplInterface = buildSchema(`
  interface SingleInterface {
    id: ID!
    name: String!
  }

  type OnlyType implements SingleInterface {
    id: ID!
    name: String!
    extra: String
  }

  type Query {
    getSingle: SingleInterface
  }
`)

/**
 * These tests are specifically designed to increase code coverage
 * by testing edge cases and less common code paths.
 */
describe('Generator Coverage Tests', () => {
  // ===========================================================================
  // Interface field selections
  // ===========================================================================
  describe('interface field selections', () => {
    it('should handle direct field selection on interface', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on Node {
                title
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('title')
    })

    it('should handle field selection on Media interface', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on Media {
                provider
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('provider')
    })
  })

  // ===========================================================================
  // Fragment spreads on abstract types
  // ===========================================================================
  describe('fragment spreads on abstract types', () => {
    it('should handle fragment spread on interface type', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment nodeFields on Node { title }', 'fragment.graphql'),
        toDocument(
          `query test {
            getRandomEntity {
              ...nodeFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('NodeFieldsFragment')
      expect(source).toContain('title')
    })

    it('should handle fragment spread on Entity interface', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment entityFields on Entity { id, entityType }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              ...entityFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('EntityFieldsFragment')
    })

    it('should handle fragment on concrete type within abstract type query', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment articleFields on NodeArticle { title, body }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              ...articleFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('ArticleFieldsFragment')
    })
  })

  // ===========================================================================
  // Union type selections
  // ===========================================================================
  describe('union type selections', () => {
    it('should handle selections on SearchResult union', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query search {
            search(text: "test") {
              ... on MediaVideo {
                id
                videoUrl
              }
              ... on NodeArticle {
                id
                title
                body
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('videoUrl')
      expect(source).toContain('body')
    })

    it('should handle fragment spread within union type selection', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment videoFields on MediaVideo { videoUrl, provider }',
          'fragment.graphql',
        ),
        toDocument(
          `query search {
            search(text: "test") {
              ... on MediaVideo {
                ...videoFields
              }
              ... on NodeArticle {
                title
              }
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('VideoFieldsFragment')
    })
  })

  // ===========================================================================
  // Nullable array handling
  // ===========================================================================
  describe('nullable arrays', () => {
    it('should handle fully nullable arrays', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            nullableArray {
              nullableId
              nonNullableId
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('nullableArray')
    })

    it('should handle non-nullable arrays with nullable items', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            nonNullableArray {
              nullableId
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('nonNullableArray')
    })

    it('should handle fully non-nullable arrays', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            fullyNonNullableArray {
              nonNullableId
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('fullyNonNullableArray')
    })
  })

  // ===========================================================================
  // Complex nested selections
  // ===========================================================================
  describe('complex nested selections', () => {
    it('should handle nested interface selections within objects', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                categories {
                  related {
                    id
                    ... on NodePage {
                      title
                      body
                    }
                  }
                }
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('categories')
      expect(source).toContain('related')
    })

    it('should handle deeply nested fragment spreads', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment authorInfo on Author { name, email }',
          'author.graphql',
        ),
        toDocument(
          'fragment categoryInfo on Category { label, url }',
          'category.graphql',
        ),
        toDocument(
          `fragment articleInfo on NodeArticle {
            title
            author { ...authorInfo }
            categories { ...categoryInfo }
          }`,
          'article.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                ...articleInfo
              }
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('AuthorInfoFragment')
      expect(source).toContain('CategoryInfoFragment')
      expect(source).toContain('ArticleInfoFragment')
    })
  })

  // ===========================================================================
  // Menu recursive type
  // ===========================================================================
  describe('recursive types', () => {
    it('should handle menu with recursive subtree', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query getMenu {
            getMenu(name: "main") {
              name
              links {
                link { label, url }
                subtree {
                  link { label, url }
                  subtree {
                    link { label, url }
                  }
                }
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('GetMenuQuery')
      expect(source).toContain('subtree')
    })
  })

  // ===========================================================================
  // Input type nesting
  // ===========================================================================
  describe('nested input types', () => {
    it('should handle nested input types', () => {
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

      // SubmitContactForm has nested Address input type
      expect(source).toContain('SubmitContactForm')
      expect(source).toContain('Address')
      expect(source).toContain('street')
      expect(source).toContain('zipCode')
    })
  })

  // ===========================================================================
  // Enum with default value in input
  // ===========================================================================
  describe('enum with default values', () => {
    it('should handle enums with default values in input types', () => {
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

      // ContactMethod is an enum with default value
      expect(source).toContain('ContactMethod')
    })
  })

  // ===========================================================================
  // Debug mode
  // ===========================================================================
  describe('debug mode', () => {
    it('should output debug information when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const generator = new Generator(schema, {
        debugMode: true,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment test on User { email }', 'fragment.graphql'),
        toDocument(
          'query test { getRandomEntity { ...test } }',
          'query.graphql',
        ),
      ])

      generator.build()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should log during update when debug mode enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const generator = new Generator(schema, {
        debugMode: true,
        output: { typeComment: false },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'test.graphql'),
      )
      generator.build()

      generator.update(
        toDocument('query test { getHomepage { body } }', 'test.graphql'),
      )

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  // ===========================================================================
  // Dependency tracking disabled
  // ===========================================================================
  describe('dependency tracking disabled', () => {
    it('should work with dependency tracking disabled', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment user on User { email }', 'fragment.graphql'),
        toDocument(
          'query test { getRandomEntity { ...user } }',
          'query.graphql',
        ),
      ])

      const result = generator.build()
      expect(result.getOperations('ts').getSource()).toContain('UserFragment')
    })

    it('should generate errors without file context when dependency tracking disabled', () => {
      const generator = new Generator(schema, {
        dependencyTracking: false,
      })
      generator.add(
        toDocument(
          'query test { getHomepage { nonExistent } }',
          'query.graphql',
        ),
      )

      expect(() => generator.build()).toThrow()
    })
  })

  // ===========================================================================
  // Multiple inline fragments on same type
  // ===========================================================================
  describe('multiple inline fragments', () => {
    it('should merge multiple inline fragments on the same type', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodePage {
                title
              }
              ... on NodePage {
                body
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('title')
      expect(source).toContain('body')
    })
  })

  // ===========================================================================
  // Empty selections
  // ===========================================================================
  describe('empty and minimal selections', () => {
    it('should handle query with only __typename', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              __typename
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('__typename')
    })

    it('should handle abstract type with only __typename', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            search(text: "test") {
              __typename
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('__typename')
    })
  })

  // ===========================================================================
  // Skip/include directives
  // ===========================================================================
  describe('conditional directives', () => {
    it('should handle @skip directive', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test($skip: Boolean!) {
            getHomepage {
              title
              body @skip(if: $skip)
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Field with @skip should be optional
      expect(source).toContain('body?:')
    })

    it('should handle @include directive', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test($include: Boolean!) {
            getHomepage {
              title
              body @include(if: $include)
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Field with @include should be optional
      expect(source).toContain('body?:')
    })
  })

  // ===========================================================================
  // Output options edge cases
  // ===========================================================================
  describe('output options edge cases', () => {
    it('should handle nullableArrayElements option', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          nullableArrayElements: true,
        },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                tags
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // tags is [String] which has nullable elements
      expect(source).toContain('null')
    })

    it('should handle mergeTypenames option', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          mergeTypenames: false,
        },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              __typename
              id
              ... on NodePage {
                __typename
                title
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toBeDefined()
    })
  })

  // ===========================================================================
  // Field arguments
  // ===========================================================================
  describe('field arguments', () => {
    it('should handle field with arguments', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            searchContent(text: "hello", bundle: "article", bundleRequired: "page") {
              title
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('TestQuery')
    })

    it('should handle nullable field arguments with defaults', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test($text: String, $bundleRequired: String!) {
            searchContent(text: $text, bundleRequired: $bundleRequired) {
              title
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('text?:')
      expect(source).toContain('bundleRequired:')
    })
  })

  // ===========================================================================
  // Entity with multiple interface implementations
  // ===========================================================================
  describe('multiple interface implementations', () => {
    it('should handle types implementing multiple interfaces', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on MediaImage {
                id
                entityType
                provider
                image
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // MediaImage implements Entity & Media
      expect(source).toContain('image')
      expect(source).toContain('provider')
    })
  })

  // ===========================================================================
  // Cache behavior
  // ===========================================================================
  describe('cache behavior', () => {
    it('should use cache for repeated fragment generation', () => {
      const generator = new Generator(schema, {
        useCache: true,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment user on User { email, name }', 'fragment.graphql'),
        toDocument('query q1 { getRandomEntity { ...user } }', 'q1.graphql'),
        toDocument('query q2 { getRandomEntity { ...user } }', 'q2.graphql'),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Both queries should use the same UserFragment
      expect(source).toContain('UserFragment')
      expect(source).toContain('Q1Query')
      expect(source).toContain('Q2Query')
    })
  })

  // ===========================================================================
  // Non-null entity query
  // ===========================================================================
  describe('non-null root fields', () => {
    it('should handle non-null entity return type', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getNonNullEntity {
              id
              ... on NodePage {
                title
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // getNonNullEntity returns Entity! so should not be optional
      expect(source).toContain('getNonNullEntity:')
      expect(source).not.toContain('getNonNullEntity?:')
    })
  })

  // ===========================================================================
  // ArrayShape with generics
  // ===========================================================================
  describe('arrayShape with generics', () => {
    it('should handle arrayShape using generics syntax', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          arrayShape: 'Array<$T$>',
        },
      })
      generator.add(
        toDocument(
          `query test {
            nonNullableArray {
              nullableId
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('Array<')
    })

    it('should handle arrayShape with ReadonlyArray generics', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          arrayShape: 'ReadonlyArray<$T$>',
        },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                tags
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('ReadonlyArray<')
    })
  })

  // ===========================================================================
  // Unnamed operations
  // ===========================================================================
  describe('unnamed operations', () => {
    it('should skip unnamed operations in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const generator = new Generator(schema, {
        debugMode: true,
        output: { typeComment: false },
      })
      generator.add(toDocument(`{ getHomepage { title } }`, 'query.graphql'))

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // No operation types should be generated for unnamed operations
      expect(source).not.toContain('Query')

      consoleSpy.mockRestore()
    })

    it('should silently skip unnamed operations without debug mode', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(toDocument(`{ getHomepage { title } }`, 'query.graphql'))

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Should produce empty or minimal output
      expect(source).not.toContain('Query')
    })
  })

  // ===========================================================================
  // useCache with dependencyTracking disabled
  // ===========================================================================
  describe('useCache with dependencyTracking disabled', () => {
    it('should cache fragment IR fields when useCache true and dependencyTracking false', () => {
      const generator = new Generator(schema, {
        useCache: true,
        dependencyTracking: false,
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment user on User { email, name }', 'fragment.graphql'),
        toDocument('query q1 { getRandomEntity { ...user } }', 'q1.graphql'),
        toDocument('query q2 { getRandomEntity { ...user } }', 'q2.graphql'),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('UserFragment')
      expect(source).toContain('Q1Query')
      expect(source).toContain('Q2Query')
    })

    it('should cache input type TS when useCache true and dependencyTracking false', () => {
      const generator = new Generator(schema, {
        useCache: true,
        dependencyTracking: false,
        output: { typeComment: false },
      })
      // Use mutations with input types to trigger createInputTS with caching
      generator.add([
        toDocument(
          `mutation m1($input: SubmitContactForm!) { submitForm(input: $input) }`,
          'm1.graphql',
        ),
        toDocument(
          `mutation m2($input: SubmitContactForm!) { submitForm(input: $input) }`,
          'm2.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SubmitContactForm')
      expect(source).toContain('M1Mutation')
      expect(source).toContain('M2Mutation')
    })

    it('should handle nested input types with cache and no dependency tracking', () => {
      const generator = new Generator(schema, {
        useCache: true,
        dependencyTracking: false,
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `mutation submit($input: SubmitContactForm!) { submitForm(input: $input) }`,
          'mutation.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // SubmitContactForm has nested Address input type
      expect(source).toContain('Address')
      expect(source).toContain('street')
    })
  })

  // ===========================================================================
  // Format code options
  // ===========================================================================
  describe('formatCode options', () => {
    it('should use custom formatCode function when provided', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          formatCode: (code): string => `/* FORMATTED */\n${code}`,
        },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'query.graphql'),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('/* FORMATTED */')
    })

    it('should skip formatting when formatCode is false', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          formatCode: false,
        },
      })
      generator.add(
        toDocument('query test { getHomepage { title } }', 'query.graphql'),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('TestQuery')
    })
  })

  // ===========================================================================
  // Fragment spread on different type condition (lines 669-671)
  // ===========================================================================
  describe('fragment spread on different type condition', () => {
    it('should keep fragment spread when type condition differs from current type', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        // Fragment on MediaVideo, but we're querying Entity which includes NodeArticle
        toDocument(
          'fragment videoFields on MediaVideo { videoUrl }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              id
              ...videoFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Fragment should be used in the type
      expect(source).toContain('VideoFieldsFragment')
    })

    it('should not inline fragment with different type condition during recursive inlining', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        // Inner fragment on MediaVideo (different from Query)
        toDocument(
          'fragment innerFields on MediaVideo { videoUrl }',
          'inner.graphql',
        ),
        // Outer fragment on Query that uses inner fragment
        toDocument(
          `fragment outerFields on Query {
            getRandomEntity {
              ...innerFields
            }
          }`,
          'outer.graphql',
        ),
        // Query that spreads outer fragment at root level
        toDocument(
          `query test {
            ...outerFields
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Both fragments should be used
      expect(source).toContain('InnerFieldsFragment')
    })
  })

  // ===========================================================================
  // Inline fragment on unrelated type (lines 1105-1107)
  // ===========================================================================
  describe('inline fragment on unrelated type', () => {
    it('should skip inline fragment when type does not match object', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                title
                ... on MediaVideo {
                  videoUrl
                }
              }
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // NodeArticle should have title, but not videoUrl (MediaVideo is unrelated)
      expect(source).toContain('title')
      // The videoUrl should not appear in the NodeArticle branch
    })
  })

  // ===========================================================================
  // Typename exclusion with fragment spreads (lines 1775-1782)
  // ===========================================================================
  describe('typename exclusion with fragment spreads', () => {
    it('should use Exclude for __typename when fragment spreads do not cover all types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment articleFields on NodeArticle { title, body }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              __typename
              ...articleFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Should have Exclude in the output because articleFields only covers NodeArticle
      // but Entity has many more implementing types
      expect(source).toContain('Exclude<')
    })
  })

  // ===========================================================================
  // Empty branches in abstract selection (lines 1639-1644)
  // ===========================================================================
  describe('empty branches in abstract selection', () => {
    it('should handle abstract type query with only base interface fields', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      // Query only interface-level fields, no inline fragments
      generator.add(
        toDocument(
          `query test {
            getRandomEntity {
              id
              entityType
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('id')
      expect(source).toContain('entityType')
    })
  })

  // ===========================================================================
  // Field merging (line 1057)
  // ===========================================================================
  describe('field merging in object selection', () => {
    it('should merge overlapping field selections', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getHomepage {
              title
              title
              body
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('title')
      expect(source).toContain('body')
    })

    it('should merge nested field selections with fragments', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment authorName on Author { name }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              ... on NodeArticle {
                author {
                  name
                  email
                }
                author {
                  ...authorName
                }
              }
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('name')
      expect(source).toContain('email')
    })
  })

  // ===========================================================================
  // Custom scalar type (line 1906)
  // ===========================================================================
  describe('custom scalar type', () => {
    it('should handle custom scalar with default buildScalarType', () => {
      const generator = new Generator(schemaWithCustomScalar, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            now
            created
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Default scalar type should be 'any' for unknown scalars
      expect(source).toContain('any')
    })

    it('should handle custom scalar with custom buildScalarType', () => {
      const generator = new Generator(schemaWithCustomScalar, {
        output: { typeComment: false },
        buildScalarType: (type): string | null => {
          if (type.name === 'DateTime') {
            return 'string'
          }
          return null
        },
      })
      generator.add(
        toDocument(
          `query test {
            now
            created
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('string')
    })

    it('should fallback to any when buildScalarType returns null', () => {
      const generator = new Generator(schemaWithCustomScalar, {
        output: { typeComment: false },
        buildScalarType: (): null => null,
      })
      generator.add(toDocument('query test { now }', 'query.graphql'))

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('any')
    })
  })

  // ===========================================================================
  // Empty interface/union (lines 826-834, 863)
  // ===========================================================================
  describe('empty interface', () => {
    it('should handle interface with no implementing types', () => {
      const generator = new Generator(schemaWithEmptyInterface, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getEmpty {
              id
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // With no implementing types, the result is essentially empty
      expect(source).toContain('TestQuery')
    })

    it('should produce never for empty interface __typename', () => {
      const generator = new Generator(schemaWithEmptyInterface, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getEmpty {
              __typename
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Should produce 'never' for empty interface typename union
      expect(source).toContain('never')
    })

    it('should produce never for empty interface with nonOptionalTypename', () => {
      const generator = new Generator(schemaWithEmptyInterface, {
        output: {
          typeComment: false,
          nonOptionalTypename: true,
        },
      })
      generator.add(
        toDocument(
          `query test {
            getEmpty {
              id
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Should produce 'never' for empty interface typename union
      expect(source).toContain('never')
    })
  })

  // ===========================================================================
  // Fragment on interface with __typename and partial coverage (lines 1775-1782)
  // ===========================================================================
  describe('fragment with __typename and partial coverage', () => {
    it('should produce Exclude type when fragments do not cover all types', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        // Fragment only covers NodeArticle, not all Entity types
        toDocument(
          'fragment articleOnly on NodeArticle { __typename, title }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              __typename
              ...articleOnly
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      // Should have Exclude<Entity, NodeArticle> pattern
      expect(source).toContain('Exclude<')
      expect(source).toContain('NodeArticle')
    })

    it('should handle multiple fragment spreads with __typename', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment pageFields on NodePage { __typename, title }',
          'page.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { __typename, title }',
          'article.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              __typename
              ...pageFields
              ...articleFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('PageFieldsFragment')
      expect(source).toContain('ArticleFieldsFragment')
    })
  })

  // ===========================================================================
  // Selection set on various types (lines 963-969, 1639-1644)
  // ===========================================================================
  describe('selection set edge cases', () => {
    it('should handle abstract type with no type-specific selections', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      // Query abstract type but only select interface-level fields
      generator.add(
        toDocument(
          `query test {
            search(text: "foo") {
              __typename
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('__typename')
    })

    it('should handle union with only __typename selected', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            search(text: "test") {
              __typename
            }
          }`,
          'query.graphql',
        ),
      )

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('MediaVideo')
      expect(source).toContain('NodeArticle')
    })
  })

  // ===========================================================================
  // Fragment spread when fragment IR not yet generated (lines 992-997)
  // ===========================================================================
  describe('fragment generation order', () => {
    it('should generate fragment IR on demand when not yet created', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      // Add operation first, then fragment
      // This ensures fragment IR is generated on demand
      generator.add([
        toDocument(
          `query test {
            getRandomEntity {
              ...lazyFragment
            }
          }`,
          'query.graphql',
        ),
        toDocument(
          'fragment lazyFragment on User { email }',
          'fragment.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('LazyFragmentFragment')
    })

    it('should handle fragments that spread other fragments', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment inner on User { email }', 'inner.graphql'),
        toDocument(
          'fragment outer on User { ...inner, name }',
          'outer.graphql',
        ),
        toDocument(
          `query test {
            getRandomEntity {
              ...outer
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('InnerFragment')
      expect(source).toContain('OuterFragment')
    })
  })

  // ===========================================================================
  // FieldNotFoundError on interface (lines 1325-1331)
  // ===========================================================================
  describe('field not found on interface', () => {
    it('should throw FieldNotFoundError when selecting non-existent field on interface', () => {
      // Create schema where we can query an interface directly
      const interfaceSchema = buildSchema(`
        interface Animal {
          name: String!
        }
        type Dog implements Animal {
          name: String!
          breed: String!
        }
        type Query {
          getAnimal: Animal
        }
      `)

      const generator = new Generator(interfaceSchema, {
        output: { typeComment: false },
      })
      generator.add(
        toDocument(
          `query test {
            getAnimal {
              nonExistentField
            }
          }`,
          'query.graphql',
        ),
      )

      expect(() => generator.build()).toThrow()
    })
  })

  // ===========================================================================
  // Line 1553 - objectTypeMap default value
  // ===========================================================================
  describe('object type map edge cases', () => {
    it('should handle fragment spread in abstract type selection', () => {
      const generator = new Generator(schema, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument('fragment nodeBase on Node { title }', 'fragment.graphql'),
        toDocument(
          `query test {
            getRandomEntity {
              ... on Node {
                ...nodeBase
              }
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('NodeBaseFragment')
    })

    it('should handle interface with single implementing type', () => {
      const generator = new Generator(schemaWithSingleImplInterface, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment singleFields on SingleInterface { id, name }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getSingle {
              ...singleFields
              ... on OnlyType {
                extra
              }
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('SingleFieldsFragment')
      expect(source).toContain('extra')
    })

    it('should handle fragment spread on interface within interface query', () => {
      const generator = new Generator(schemaWithSingleImplInterface, {
        output: { typeComment: false },
      })
      generator.add([
        toDocument(
          'fragment interfaceFields on SingleInterface { name }',
          'fragment.graphql',
        ),
        toDocument(
          `query test {
            getSingle {
              id
              ...interfaceFields
            }
          }`,
          'query.graphql',
        ),
      ])

      const result = generator.build()
      const source = result.getOperations('ts').getSource()

      expect(source).toContain('InterfaceFieldsFragment')
    })
  })
})
