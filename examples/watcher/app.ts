import chokidar from 'chokidar'
import type { GraphQLSchema } from 'graphql'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadSchema } from '@graphql-tools/load'
import { glob } from 'glob'
import { Generator, type GeneratorOutputFile } from '../../src'
import { notNullish } from '../../src/helpers/type'

const filesFolder = fileURLToPath(new URL('./graphql', import.meta.url))
const outputFolder = fileURLToPath(new URL('./output', import.meta.url))

async function getSchema(): Promise<GraphQLSchema> {
  const schemaFilePath = fileURLToPath(
    new URL('./../../__tests__/unit/Generator/schema.graphql', import.meta.url),
  )
  const schemaFile = await fs.readFile(schemaFilePath)
  return await loadSchema(schemaFile.toString(), {
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
  const generator = new Generator(schema, {
    output: {
      buildTypeDocFilePath: (filePath): string => {
        return filePath.replace(filesFolder, './../graphql')
      },
    },
  })

  // Generate and write output files.
  const buildOutput = async (): Promise<void> => {
    try {
      const result = generator.build()
      await writeOutput('types.d.ts', result.getTypes())
      await writeOutput('enums.ts', result.getNonTypes())
      await writeOutput('operations.js', result.getOperationsFile())
      await writeOutput(
        'operations.d.ts',
        result.getOperationTypesFile({ importFrom: './types' }),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const shouldIgnore = (filePath: string): boolean =>
    !filePath.endsWith('.graphql')

  const addOrUpdate = async (filePath: string): Promise<void> => {
    try {
      if (shouldIgnore(filePath)) {
        return
      }
      const doc = await loadFile(filePath)
      if (!doc) {
        generator.remove(filePath)
        return
      }

      if (generator.hasFilePath(filePath)) {
        generator.update(doc)
      } else {
        generator.add(doc)
      }
    } catch (e) {
      console.error(e)
    }
    buildOutput()
  }

  const onFileDelete = async (filePath: string): Promise<void> => {
    if (shouldIgnore(filePath)) {
      return
    }
    generator.remove(filePath)
    buildOutput()
  }

  const watcher = chokidar.watch(filesFolder, {
    persistent: true,
    ignoreInitial: true,
  })

  watcher
    .on('add', addOrUpdate)
    .on('change', addOrUpdate)
    .on('unlink', onFileDelete)

  // Add inital files.
  const files = await glob(filesFolder + '/**/*.graphql')
  const docs = await Promise.all(files.map(loadFile))
  generator.add(docs.filter(notNullish))
  await buildOutput()
}

await main()
process.stdin.resume()
