import { describe, expect, it } from 'vitest'
import { parse } from 'graphql'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('GeneratorOutput.getFragmentDocumentWithFragments', () => {
  describe('basic functionality', () => {
    it('returns fragment source when no nested fragments are used', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title, body }',
          'fragment.page.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('pageFields')

      expect(document).toContain('fragment pageFields on NodePage')
      expect(document).toContain('title')
      expect(document).toContain('body')
    })

    it('includes single nested fragment dependency', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { title, author { ...authorFields } }',
          'fragment.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('articleFields')

      expect(document).toContain('fragment articleFields on NodeArticle')
      expect(document).toContain('fragment authorFields on Author')
    })

    it('includes multiple nested fragment dependencies', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment categoryFields on Category { label, url }',
          'fragment.category.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { title, author { ...authorFields }, categories { ...categoryFields } }',
          'fragment.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('articleFields')

      expect(document).toContain('fragment articleFields on NodeArticle')
      expect(document).toContain('fragment authorFields on Author')
      expect(document).toContain('fragment categoryFields on Category')
    })
  })

  describe('deeply nested fragment dependencies', () => {
    it('includes deeply nested fragments (A -> B -> C)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment entityBase on Entity { id, entityType }',
          'fragment.entity.graphql',
        ),
        toDocument(
          'fragment relatedEntity on Entity { ...entityBase }',
          'fragment.related.graphql',
        ),
        toDocument(
          'fragment categoryWithRelated on Category { label, related { ...relatedEntity } }',
          'fragment.category.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments(
        'categoryWithRelated',
      )

      expect(document).toContain('fragment categoryWithRelated on Category')
      expect(document).toContain('fragment relatedEntity on Entity')
      expect(document).toContain('fragment entityBase on Entity')
    })

    it('includes very deeply nested fragments (A -> B -> C -> D)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment level4 on Author { name }',
          'fragment.level4.graphql',
        ),
        toDocument(
          'fragment level3 on NodeArticle { author { ...level4 } }',
          'fragment.level3.graphql',
        ),
        toDocument(
          'fragment level2 on Entity { ... on NodeArticle { ...level3 } }',
          'fragment.level2.graphql',
        ),
        toDocument(
          'fragment level1 on Category { related { ...level2 } }',
          'fragment.level1.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('level1')

      expect(document).toContain('fragment level1 on Category')
      expect(document).toContain('fragment level2 on Entity')
      expect(document).toContain('fragment level3 on NodeArticle')
      expect(document).toContain('fragment level4 on Author')
    })
  })

  describe('deduplication', () => {
    it('includes shared fragments only once (diamond dependency)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment sharedFields on Author { name, email }',
          'fragment.shared.graphql',
        ),
        toDocument(
          'fragment branchA on NodeArticle { author { ...sharedFields } }',
          'fragment.branchA.graphql',
        ),
        toDocument(
          'fragment branchB on Comment { author { ...sharedFields } }',
          'fragment.branchB.graphql',
        ),
        toDocument(
          'fragment combined on Entity { ... on NodeArticle { ...branchA } ... on Comment { ...branchB } }',
          'fragment.combined.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('combined')

      // Count occurrences of sharedFields fragment
      const matches = document.match(/fragment sharedFields on Author/g)
      expect(matches).toHaveLength(1)

      expect(document).toContain('fragment combined on Entity')
      expect(document).toContain('fragment branchA on NodeArticle')
      expect(document).toContain('fragment branchB on Comment')
    })
  })

  describe('error handling', () => {
    it('throws error when fragment is not found', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment existingFragment on NodePage { title }',
          'fragment.existing.graphql',
        ),
      ])

      const result = generator.build()

      expect(() =>
        result.getFragmentDocumentWithFragments('nonExistentFragment'),
      ).toThrow('Fragment "nonExistentFragment" not found.')
    })

    it('throws descriptive error with fragment name', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument(
          'fragment myFragment on NodePage { title }',
          'fragment.graphql',
        ),
      ])

      const result = generator.build()

      expect(() =>
        result.getFragmentDocumentWithFragments('someOtherFragment'),
      ).toThrow('someOtherFragment')
    })
  })

  describe('output format', () => {
    it('separates fragments with double newlines', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { author { ...authorFields } }',
          'fragment.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('articleFields')

      // Should have double newline between fragments
      expect(document).toMatch(/\}\n\nfragment/)
    })

    it('returns valid GraphQL that could be parsed', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { title, author { ...authorFields } }',
          'fragment.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getFragmentDocumentWithFragments('articleFields')

      // The document should be parseable GraphQL
      expect(() => parse(document)).not.toThrow()
    })
  })

  describe('multiple fragments', () => {
    it('returns correct document for each fragment', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment baseFields on Entity { id }',
          'fragment.base.graphql',
        ),
        toDocument(
          'fragment pageFields on NodePage { title, ...baseFields }',
          'fragment.page.graphql',
        ),
        toDocument(
          'fragment simpleFields on NodeArticle { title }',
          'fragment.simple.graphql',
        ),
      ])

      const result = generator.build()

      const pageDocument = result.getFragmentDocumentWithFragments('pageFields')
      const simpleDocument =
        result.getFragmentDocumentWithFragments('simpleFields')

      // pageFields should include baseFields
      expect(pageDocument).toContain('fragment pageFields on NodePage')
      expect(pageDocument).toContain('fragment baseFields on Entity')

      // simpleFields should not include baseFields
      expect(simpleDocument).toContain('fragment simpleFields on NodeArticle')
      expect(simpleDocument).not.toContain('fragment baseFields on Entity')
    })
  })

  describe('lazy initialization', () => {
    it('works correctly when called multiple times', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { author { ...authorFields } }',
          'fragment.article.graphql',
        ),
      ])

      const result = generator.build()

      // Call multiple times to test lazy initialization
      const document1 = result.getFragmentDocumentWithFragments('articleFields')
      const document2 = result.getFragmentDocumentWithFragments('articleFields')
      const document3 = result.getFragmentDocumentWithFragments('articleFields')

      expect(document1).toBe(document2)
      expect(document2).toBe(document3)
    })
  })
})

describe('GeneratorOutput.getOperationDocumentWithFragments', () => {
  describe('basic functionality', () => {
    it('returns operation source when no fragments are used', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          `query getHomepage { getHomepage { title } }`,
          'query.homepage.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getHomepage')

      expect(document).toContain('query getHomepage')
      expect(document).toContain('getHomepage')
      expect(document).toContain('title')
    })

    it('includes single direct fragment dependency', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title, body }',
          'fragment.page.graphql',
        ),
        toDocument(
          `query getHomepage { getHomepage { ...pageFields } }`,
          'query.homepage.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getHomepage')

      expect(document).toContain('query getHomepage')
      expect(document).toContain('...pageFields')
      expect(document).toContain('fragment pageFields on NodePage')
      expect(document).toContain('title')
      expect(document).toContain('body')
    })

    it('includes multiple direct fragment dependencies', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment categoryFields on Category { label, url }',
          'fragment.category.graphql',
        ),
        toDocument(
          `query getArticle {
            getRandomEntity {
              ... on NodeArticle {
                author { ...authorFields }
                categories { ...categoryFields }
              }
            }
          }`,
          'query.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getArticle')

      expect(document).toContain('query getArticle')
      expect(document).toContain('fragment authorFields on Author')
      expect(document).toContain('fragment categoryFields on Category')
    })
  })

  describe('nested fragment dependencies', () => {
    it('includes nested fragment dependencies (A -> B)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { title, author { ...authorFields } }',
          'fragment.article.graphql',
        ),
        toDocument(
          `query getArticle { getRandomEntity { ...articleFields } }`,
          'query.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getArticle')

      expect(document).toContain('query getArticle')
      expect(document).toContain('fragment articleFields on NodeArticle')
      expect(document).toContain('fragment authorFields on Author')
    })

    it('includes deeply nested fragment dependencies (A -> B -> C)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment entityBase on Entity { id, entityType }',
          'fragment.entity.graphql',
        ),
        toDocument(
          'fragment relatedEntity on Entity { ...entityBase }',
          'fragment.related.graphql',
        ),
        toDocument(
          'fragment categoryWithRelated on Category { label, related { ...relatedEntity } }',
          'fragment.category.graphql',
        ),
        toDocument(
          'fragment articleFull on NodeArticle { title, categories { ...categoryWithRelated } }',
          'fragment.article.graphql',
        ),
        toDocument(
          `query getArticle { getRandomEntity { ...articleFull } }`,
          'query.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getArticle')

      expect(document).toContain('query getArticle')
      expect(document).toContain('fragment articleFull on NodeArticle')
      expect(document).toContain('fragment categoryWithRelated on Category')
      expect(document).toContain('fragment relatedEntity on Entity')
      expect(document).toContain('fragment entityBase on Entity')
    })

    it('includes very deeply nested fragments (A -> B -> C -> D -> E)', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment level5 on Author { name }',
          'fragment.level5.graphql',
        ),
        toDocument(
          'fragment level4 on NodeArticle { author { ...level5 } }',
          'fragment.level4.graphql',
        ),
        toDocument(
          'fragment level3 on Entity { ... on NodeArticle { ...level4 } }',
          'fragment.level3.graphql',
        ),
        toDocument(
          'fragment level2 on Category { related { ...level3 } }',
          'fragment.level2.graphql',
        ),
        toDocument(
          'fragment level1 on NodeArticle { categories { ...level2 } }',
          'fragment.level1.graphql',
        ),
        toDocument(
          `query deepQuery { getRandomEntity { ...level1 } }`,
          'query.deep.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('deepQuery')

      expect(document).toContain('fragment level1 on NodeArticle')
      expect(document).toContain('fragment level2 on Category')
      expect(document).toContain('fragment level3 on Entity')
      expect(document).toContain('fragment level4 on NodeArticle')
      expect(document).toContain('fragment level5 on Author')
    })
  })

  describe('deduplication', () => {
    it('includes shared fragments only once (diamond dependency)', () => {
      const generator = new Generator(schema)

      // Diamond: query -> fragmentA, fragmentB; fragmentA -> shared; fragmentB -> shared
      generator.add([
        toDocument(
          'fragment sharedFields on Author { name, email }',
          'fragment.shared.graphql',
        ),
        toDocument(
          'fragment fragmentA on NodeArticle { title, author { ...sharedFields } }',
          'fragment.a.graphql',
        ),
        toDocument(
          'fragment fragmentB on Comment { subject, author { ...sharedFields } }',
          'fragment.b.graphql',
        ),
        toDocument(
          `query diamondQuery {
            getRandomEntity {
              ... on NodeArticle { ...fragmentA }
              ... on Comment { ...fragmentB }
            }
          }`,
          'query.diamond.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('diamondQuery')

      // Count occurrences of sharedFields fragment
      const matches = document.match(/fragment sharedFields on Author/g)
      expect(matches).toHaveLength(1)

      expect(document).toContain('fragment fragmentA on NodeArticle')
      expect(document).toContain('fragment fragmentB on Comment')
    })

    it('handles fragment used multiple times at different levels', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleWithAuthor on NodeArticle { title, author { ...authorFields } }',
          'fragment.article.graphql',
        ),
        toDocument(
          `query multiUse {
            getRandomEntity {
              ... on NodeArticle {
                ...articleWithAuthor
                author { ...authorFields }
              }
            }
          }`,
          'query.multiuse.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('multiUse')

      // authorFields should appear only once despite being used at multiple levels
      const matches = document.match(/fragment authorFields on Author/g)
      expect(matches).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    it('throws error when operation is not found', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          `query existingQuery { getHomepage { title } }`,
          'query.existing.graphql',
        ),
      ])

      const result = generator.build()

      expect(() =>
        result.getOperationDocumentWithFragments('nonExistentQuery'),
      ).toThrow('Operation "nonExistentQuery" not found.')
    })

    it('throws descriptive error with operation name', () => {
      const generator = new Generator(schema)
      generator.add([
        toDocument(`query myQuery { getHomepage { title } }`, 'query.graphql'),
      ])

      const result = generator.build()

      expect(() =>
        result.getOperationDocumentWithFragments('someOtherOperation'),
      ).toThrow('someOtherOperation')
    })
  })

  describe('different operation types', () => {
    it('works with mutations', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          `mutation submitForm($input: SubmitContactForm!) {
            submitForm(input: $input)
          }`,
          'mutation.submit.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('submitForm')

      expect(document).toContain('mutation submitForm')
      expect(document).toContain('$input: SubmitContactForm!')
    })

    it('works with subscriptions', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          `subscription onFormSubmit { formSubmitted { id, timestamp } }`,
          'subscription.form.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('onFormSubmit')

      expect(document).toContain('subscription onFormSubmit')
      expect(document).toContain('formSubmitted')
    })

    it('works with mutation that uses fragments', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment submissionFields on FormSubmission { id, timestamp }',
          'fragment.submission.graphql',
        ),
        toDocument(
          `subscription onFormSubmit { formSubmitted { ...submissionFields } }`,
          'subscription.form.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('onFormSubmit')

      expect(document).toContain('subscription onFormSubmit')
      expect(document).toContain('fragment submissionFields on FormSubmission')
    })
  })

  describe('output format', () => {
    it('separates operation and fragments with double newlines', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title }',
          'fragment.page.graphql',
        ),
        toDocument(
          `query getHomepage { getHomepage { ...pageFields } }`,
          'query.homepage.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getHomepage')

      // Should have double newline between operation and fragment
      expect(document).toMatch(/\}\n\nfragment/)
    })

    it('returns valid GraphQL that could be parsed', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment authorFields on Author { name, email }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment articleFields on NodeArticle { title, author { ...authorFields } }',
          'fragment.article.graphql',
        ),
        toDocument(
          `query getArticle { getRandomEntity { ...articleFields } }`,
          'query.article.graphql',
        ),
      ])

      const result = generator.build()
      const document = result.getOperationDocumentWithFragments('getArticle')

      // The document should be parseable GraphQL
      expect(() => parse(document)).not.toThrow()
    })
  })

  describe('multiple operations', () => {
    it('returns correct document for each operation', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title, body }',
          'fragment.page.graphql',
        ),
        toDocument(
          'fragment entityFields on Entity { id }',
          'fragment.entity.graphql',
        ),
        toDocument(
          `query queryA { getHomepage { ...pageFields } }`,
          'query.a.graphql',
        ),
        toDocument(
          `query queryB { getRandomEntity { ...entityFields } }`,
          'query.b.graphql',
        ),
      ])

      const result = generator.build()

      const documentA = result.getOperationDocumentWithFragments('queryA')
      const documentB = result.getOperationDocumentWithFragments('queryB')

      // queryA should have pageFields but not entityFields
      expect(documentA).toContain('query queryA')
      expect(documentA).toContain('fragment pageFields on NodePage')
      expect(documentA).not.toContain('fragment entityFields on Entity')

      // queryB should have entityFields but not pageFields
      expect(documentB).toContain('query queryB')
      expect(documentB).toContain('fragment entityFields on Entity')
      expect(documentB).not.toContain('fragment pageFields on NodePage')
    })
  })

  describe('lazy initialization', () => {
    it('works correctly when called multiple times', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment pageFields on NodePage { title }',
          'fragment.page.graphql',
        ),
        toDocument(
          `query getHomepage { getHomepage { ...pageFields } }`,
          'query.homepage.graphql',
        ),
      ])

      const result = generator.build()

      // Call multiple times to test lazy initialization
      const document1 = result.getOperationDocumentWithFragments('getHomepage')
      const document2 = result.getOperationDocumentWithFragments('getHomepage')
      const document3 = result.getOperationDocumentWithFragments('getHomepage')

      expect(document1).toBe(document2)
      expect(document2).toBe(document3)
    })
  })
})
