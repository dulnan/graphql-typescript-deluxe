import { describe, expect, it, vi } from 'vitest'
import schemaContent from './schema.graphql?raw'
import { Generator } from '../../../src/classes/Generator'
import { loadSchemaSync } from '@graphql-tools/load'
import { toDocument } from '../../helpers'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('Generator', () => {
  describe('reset', () => {
    it('should clear all input documents and caches', () => {
      const generator = new Generator(schema, {
        output: {
          typeComment: false,
        },
      })

      generator.add([
        toDocument(
          'fragment user on User { email }',
          'fragment.user.graphql',
        ),
        toDocument(
          `query getUser { getRandomEntity { ...user } }`,
          'query.user.graphql',
        ),
      ])

      // Build first to populate caches
      const firstBuild = generator.build()
      expect(firstBuild.getFragments()).toHaveLength(1)

      // Reset the generator
      generator.reset()

      // After reset, building should produce empty output
      const secondBuild = generator.build()
      expect(secondBuild.getFragments()).toHaveLength(0)
      expect(secondBuild.getCollectedOperations()).toHaveLength(0)
    })

    it('should return the generator instance for chaining', () => {
      const generator = new Generator(schema)
      const result = generator.reset()
      expect(result).toBe(generator)
    })
  })

  describe('debugMode', () => {
    it('should log debug information when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const generator = new Generator(schema, {
        debugMode: true,
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

      generator.build()

      // Debug mode should have logged something
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('generateOnce', () => {
    it('should generate types from schema and documents in one call', () => {
      const result = Generator.generateOnce(schema, [
        toDocument(
          `query getHomepage { getHomepage { title } }`,
          'query.homepage.graphql',
        ),
      ])

      // generateOnce returns a string (the TypeScript source)
      expect(typeof result).toBe('string')
      expect(result).toContain('GetHomepageQuery')
    })

    it('should accept options parameter', () => {
      const result = Generator.generateOnce(
        schema,
        [
          toDocument(
            `query getHomepage { getHomepage { title } }`,
            'query.homepage.graphql',
          ),
        ],
        {
          output: {
            typeComment: false,
          },
        },
      )

      // Without type comments, there should be no JSDoc @see links
      expect(result).not.toContain('@see')
    })
  })
})
