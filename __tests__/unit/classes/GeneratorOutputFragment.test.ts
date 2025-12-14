import { describe, it, expect } from 'vitest'
import { loadSchemaSync } from '@graphql-tools/load'
import { Generator } from '../../../src/classes/Generator'
import { toDocument } from '../../helpers'
import schemaContent from '../Generator/schema.graphql?raw'

const schema = loadSchemaSync(schemaContent, { loaders: [] })

describe('GeneratorOutputFragment', () => {
  describe('getGraphQLFragmentDependencies', () => {
    it('should return fragment names that the fragment depends on', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment relatedEntity on Entity { id }',
          'fragment.relatedEntity.graphql',
        ),
        toDocument(
          'fragment category on Category { related { ...relatedEntity } }',
          'fragment.category.graphql',
        ),
        toDocument(
          'fragment nodeArticle on NodeArticle { categories { ...category } }',
          'fragment.nodeArticle.graphql',
        ),
        toDocument(
          `query testQuery { getRandomEntity { ...nodeArticle } }`,
          'query.test.graphql',
        ),
      ])

      const output = generator.build()
      const fragments = output.getFragments()

      expect(fragments).toHaveLength(3)

      const nodeArticleFragment = fragments.find(
        (f) => f.node.name.value === 'nodeArticle',
      )
      const categoryFragment = fragments.find(
        (f) => f.node.name.value === 'category',
      )
      const relatedEntityFragment = fragments.find(
        (f) => f.node.name.value === 'relatedEntity',
      )

      expect(nodeArticleFragment).toBeDefined()
      expect(categoryFragment).toBeDefined()
      expect(relatedEntityFragment).toBeDefined()

      // nodeArticle spreads category, which spreads relatedEntity
      // Dependencies include the fragment itself and all transitive dependencies
      const nodeArticleDeps =
        nodeArticleFragment!.getGraphQLFragmentDependencies()
      expect(nodeArticleDeps).toContain('nodeArticle')
      expect(nodeArticleDeps).toContain('category')
      expect(nodeArticleDeps).toContain('relatedEntity')

      // category spreads relatedEntity
      const categoryDeps = categoryFragment!.getGraphQLFragmentDependencies()
      expect(categoryDeps).toContain('category')
      expect(categoryDeps).toContain('relatedEntity')

      // relatedEntity has no spreads but includes itself
      const relatedEntityDeps =
        relatedEntityFragment!.getGraphQLFragmentDependencies()
      expect(relatedEntityDeps).toContain('relatedEntity')
      expect(relatedEntityDeps).toHaveLength(1)
    })

    it('should return multiple fragment dependencies when a fragment spreads multiple fragments', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment author on Author { name }',
          'fragment.author.graphql',
        ),
        toDocument(
          'fragment category on Category { label }',
          'fragment.category.graphql',
        ),
        toDocument(
          `fragment nodeArticle on NodeArticle {
            author { ...author }
            categories { ...category }
          }`,
          'fragment.nodeArticle.graphql',
        ),
        toDocument(
          `query testQuery { getRandomEntity { ...nodeArticle } }`,
          'query.test.graphql',
        ),
      ])

      const output = generator.build()
      const fragments = output.getFragments()

      const nodeArticleFragment = fragments.find(
        (f) => f.node.name.value === 'nodeArticle',
      )

      expect(nodeArticleFragment).toBeDefined()

      const dependencies = nodeArticleFragment!.getGraphQLFragmentDependencies()
      expect(dependencies).toContain('nodeArticle')
      expect(dependencies).toContain('author')
      expect(dependencies).toContain('category')
      expect(dependencies).toHaveLength(3)
    })

    it('should include self-reference for fragments with no other fragment dependencies', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment simpleUser on User { id, email, name }',
          'fragment.user.graphql',
        ),
        toDocument(
          `query testQuery { getRandomEntity { ...simpleUser } }`,
          'query.test.graphql',
        ),
      ])

      const output = generator.build()
      const fragments = output.getFragments()

      expect(fragments).toHaveLength(1)

      const simpleUserFragment = fragments[0]!
      expect(simpleUserFragment.node.name.value).toBe('simpleUser')
      // Fragment includes itself in dependencies
      expect(simpleUserFragment.getGraphQLFragmentDependencies()).toEqual([
        'simpleUser',
      ])
    })

    it('should correctly expose filePath property', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment testFragment on User { id }',
          'my/custom/path/fragment.graphql',
        ),
        toDocument(
          `query testQuery { getRandomEntity { ...testFragment } }`,
          'query.test.graphql',
        ),
      ])

      const output = generator.build()
      const fragments = output.getFragments()

      const testFragment = fragments.find(
        (f) => f.node.name.value === 'testFragment',
      )

      expect(testFragment).toBeDefined()
      expect(testFragment!.filePath).toBe('my/custom/path/fragment.graphql')
    })

    it('should include transitive fragment dependencies', () => {
      const generator = new Generator(schema)

      generator.add([
        toDocument(
          'fragment level3 on Entity { id }',
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
          `query testQuery { getRandomEntity { ...level1 } }`,
          'query.test.graphql',
        ),
      ])

      const output = generator.build()
      const fragments = output.getFragments()

      const level1 = fragments.find((f) => f.node.name.value === 'level1')
      const level2 = fragments.find((f) => f.node.name.value === 'level2')
      const level3 = fragments.find((f) => f.node.name.value === 'level3')

      // level1 depends on level2 and transitively on level3, plus itself
      const level1Deps = level1!.getGraphQLFragmentDependencies()
      expect(level1Deps).toContain('level1')
      expect(level1Deps).toContain('level2')
      expect(level1Deps).toContain('level3')

      // level2 depends on level3, plus itself
      const level2Deps = level2!.getGraphQLFragmentDependencies()
      expect(level2Deps).toContain('level2')
      expect(level2Deps).toContain('level3')

      // level3 only includes itself
      const level3Deps = level3!.getGraphQLFragmentDependencies()
      expect(level3Deps).toEqual(['level3'])
    })
  })
})
