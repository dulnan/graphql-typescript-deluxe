import { describe, expect, it, vi } from 'vitest'
import { parse, buildSchema } from 'graphql'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

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
        toDocument('fragment authorInfo on Author { name, email }', 'author.graphql'),
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
  // Format code options
  // ===========================================================================
  describe('formatCode options', () => {
    it('should use custom formatCode function when provided', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
          formatCode: (code: string) => `/* FORMATTED */\n${code}`,
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
})
