import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { parse, print } from 'graphql'
import fs from 'node:fs'
import { Generator } from '../../../src/classes/Generator'
import schemaContent from './schema.graphql?raw'
import { generateCodegen } from './../../../helpers/generateCodegen'
import type { GeneratorOptions } from '../../../src/types/options'
import type { GeneratorOutput } from '../../../src/classes/GeneratorOutput'
import { loadSchemaSync } from '@graphql-tools/load'

const defaultSchema = loadSchemaSync(schemaContent, {
  loaders: [],
  noLocation: false,
})

const isWatch = process.env.WATCH_MODE === 'true'

function generateOutput(
  documents: string,
  customSchemaContents?: string | null,
  options?: GeneratorOptions,
): GeneratorOutput {
  const schema = customSchemaContents
    ? loadSchemaSync(customSchemaContents, { loaders: [] })
    : defaultSchema
  const generator = new Generator(schema, options)
  const documentNode = parse(documents, {
    noLocation: false,
  })
  generator.add({
    documentNode,
    filePath: './test.graphql',
  })
  return generator.build()
}

function generate(
  documents: string,
  customSchemaContents?: string | null,
  options?: GeneratorOptions,
): string {
  return generateOutput(documents, customSchemaContents, options)
    .getOperations('ts')
    .getSource()
}

/**
 * The definitions of each operation document, sorted.
 */
function getOperationDocuments(output: GeneratorOutput): string[][] {
  return output.getCollectedOperations().map((operation) =>
    parse(output.getOperationDocumentWithFragments(operation.graphqlName))
      .definitions.map((definition) => print(definition))
      .sort(),
  )
}

describe('Generator', () => {
  const cases = import.meta.glob('./cases/*/test.graphql', {
    query: '?raw',
    import: 'default',
  })

  Object.entries(cases).forEach(([folderPath, importFunction]) => {
    const caseName = folderPath.split('/')[2]

    it(`handles case "${caseName}"`, async () => {
      const query = (await importFunction()) as string
      const fileSnapshotPath = folderPath.replace('test.graphql', 'result.ts')
      const customSchemaPathRelative = folderPath.replace(
        'test.graphql',
        'schema.graphql',
      )
      const customSchemaPath = fileURLToPath(
        new URL(customSchemaPathRelative, import.meta.url),
      )
      const hasCustomSchema = fs.existsSync(customSchemaPath)
      const customSchema = hasCustomSchema
        ? fs.readFileSync(customSchemaPath).toString()
        : null
      const codegenSnapshotPath = folderPath.replace(
        'test.graphql',
        'result-codegen.ts',
      )

      // A case can override the output options in an options.json file.
      const optionsPath = customSchemaPath.replace(
        'schema.graphql',
        'options.json',
      )
      const caseOptions: GeneratorOptions = fs.existsSync(optionsPath)
        ? JSON.parse(fs.readFileSync(optionsPath).toString())
        : {}

      const baseOptions: GeneratorOptions = {
        output: {
          nullableField: 'optional',
          nonOptionalTypename: false,
          mergeTypenames: true,
          ...caseOptions.output,
        },
      }

      // First generate without cache.
      const outputWithoutCaching = generateOutput(query, customSchema, {
        ...baseOptions,
        useCache: false,
      })
      const resultWithoutCaching = outputWithoutCaching
        .getOperations('ts')
        .getSource()
      await expect(resultWithoutCaching).toMatchFileSnapshot(fileSnapshotPath)

      // Now generate with cache.
      const resultWithCaching = generate(query, customSchema, {
        ...baseOptions,
        useCache: true,
      })

      // The cached and uncached output must be identical.
      expect(
        resultWithCaching,
        'The cached and uncached output must be identical.',
      ).toEqual(resultWithoutCaching)

      // Without dependency tracking, the types must be identical, and the
      // operation documents must contain the same fragments. Their order can
      // differ.
      const outputWithoutTracking = generateOutput(query, customSchema, {
        ...baseOptions,
        dependencyTracking: false,
      })
      expect(
        outputWithoutTracking.getOperations('ts').getSource(),
        'The output without dependency tracking must be identical.',
      ).toEqual(resultWithoutCaching)
      expect(getOperationDocuments(outputWithoutTracking)).toEqual(
        getOperationDocuments(outputWithoutCaching),
      )

      // Only generate codegen comparison in watch mode
      if (isWatch) {
        const codegenSchemaContent = customSchema ?? schemaContent
        const resultCodegen = await generateCodegen(codegenSchemaContent, query)
        // eslint-disable-next-line vitest/no-conditional-expect -- environment-based conditional
        await expect(resultCodegen).toMatchFileSnapshot(codegenSnapshotPath)
      }
    })
  })
})
