import type { GraphQLSchema } from 'graphql'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { loadSchema } from '@graphql-tools/load'
import { Generator, type GeneratorOutputFile } from '../../src'

const outputFolder = fileURLToPath(new URL('./output', import.meta.url))

// const testCase = 'field-merging-nested-complex'
// const testCase = 'fragment-multiple-with-typename'
const testCase = 'typenames-inherit'

const graphqlDocumentFilePath = fileURLToPath(
  new URL(
    `./../../__tests__/unit/Generator/cases/${testCase}/test.graphql`,
    import.meta.url,
  ),
)

async function getSchemaContents(): Promise<string> {
  const schemaForTestCase = fileURLToPath(
    new URL(
      `./../../__tests__/unit/Generator/cases/${testCase}/schema.graphql`,
      import.meta.url,
    ),
  )
  if (existsSync(schemaForTestCase)) {
    return fs.readFile(schemaForTestCase).then((v) => v.toString())
  }
  const schemaFilePath = fileURLToPath(
    new URL('./../../__tests__/unit/Generator/schema.graphql', import.meta.url),
  )
  return fs.readFile(schemaFilePath).then((v) => v.toString())
}

async function getSchema(): Promise<GraphQLSchema> {
  const contents = await getSchemaContents()
  return await loadSchema(contents, {
    loaders: [],
    noLocation: true,
  })
}

async function loadFile(
  filePath: string,
): Promise<{ filePath: string; document: string } | null> {
  const buffer = await fs.readFile(filePath)
  const content = buffer.toString()
  if (!content) {
    return null
  }
  return {
    filePath,
    document: content,
  }
}

async function writeOutput(
  filePath: string,
  file: GeneratorOutputFile,
): Promise<void> {
  const dest = path.resolve(outputFolder, filePath)
  await fs.writeFile(dest, file.getSource())
}

async function main(): Promise<void> {
  const schema = await getSchema()
  const generator = new Generator(schema)

  const file = await loadFile(graphqlDocumentFilePath)

  if (!file) {
    throw new Error('Failed to load document')
  }

  generator.add(file)
  const result = generator.build()
  await writeOutput('types.d.ts', result.getOperations('d.ts'))
}

await main()
