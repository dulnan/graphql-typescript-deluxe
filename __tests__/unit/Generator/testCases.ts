import type { GeneratorOptions } from '../../../src/types/options'

type TestCase = {
  name: string

  /**
   * The path of the case folder, relative to this file.
   */
  folder: string

  /**
   * The contents of test.graphql.
   */
  document: string

  /**
   * The contents of schema.graphql, or null for the default schema.
   */
  schema: string | null

  /**
   * The options from options.json.
   */
  options: GeneratorOptions
}

const documents = import.meta.glob<string>('./cases/*/test.graphql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const schemas = import.meta.glob<string>('./cases/*/schema.graphql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const options = import.meta.glob<GeneratorOptions>('./cases/*/options.json', {
  import: 'default',
  eager: true,
})

/**
 * The test cases in the cases folder.
 */
export const TEST_CASES: TestCase[] = Object.entries(documents).map(
  ([path, document]) => {
    const folder = path.replace('/test.graphql', '')
    return {
      name: folder.replace('./cases/', ''),
      folder,
      document,
      schema: schemas[folder + '/schema.graphql'] ?? null,
      options: options[folder + '/options.json'] ?? {},
    }
  },
)
