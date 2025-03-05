import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { parse } from 'graphql'
import fs from 'node:fs'
import { Generator } from '../../../src/generator/index.js'
import schemaContent from './schema.graphql?raw'
import { format } from './../../../helpers/format.js'
import { generateCodegen } from './../../../helpers/generateCodegen.js'
import type { GeneratorOptions } from '../../../src/types/options.js'
import { loadSchemaSync } from '@graphql-tools/load'

const defaultSchema = loadSchemaSync(schemaContent, {
  loaders: [],
  noLocation: false,
})

const isWatch = process.env.WATCH_MODE === 'true'

async function generate(
  documents: string,
  customSchemaContents?: string | null,
  options?: GeneratorOptions,
): Promise<string> {
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
  const output = generator.build()
  return format(output.getEverything())
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

      const baseOptions: GeneratorOptions = {
        output: {
          nullableField: 'optional',
          nonOptionalTypename: false,
          mergeTypenames: true,
        },
      }

      // First generate without cache.
      const resultWithoutCaching = await generate(query, customSchema, {
        ...baseOptions,
        useCache: false,
      })
      await expect(resultWithoutCaching).toMatchFileSnapshot(fileSnapshotPath)

      // Now generate with cache.
      const resultWithCaching = await generate(query, customSchema, {
        ...baseOptions,
        useCache: true,
      })

      // The cached and uncached output must be identical.
      expect(
        resultWithCaching,
        'The cached and uncached output must be identical.',
      ).toEqual(resultWithoutCaching)

      if (isWatch) {
        const codegenSchemaContent = customSchema ?? schemaContent
        // Also generate an output with graphql-codegen for reference.
        const resultCodegen = await generateCodegen(
          codegenSchemaContent,
          query,
        ).then(format)
        await expect(resultCodegen).toMatchFileSnapshot(codegenSnapshotPath)
      }
    })
  })
})
