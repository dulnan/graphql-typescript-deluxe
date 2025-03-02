import { promises as fs, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSchema } from '@graphql-tools/load'
import { type DocumentNode, parse, print } from 'graphql'
import { Generator } from './../dist'
import { format } from './../helpers/format.js'
import { generateCodegen } from '../helpers/generateCodegen.js'

const isProfiling = process.env.PROFILE === 'true'

const graphqlFolder = fileURLToPath(new URL('./graphql', import.meta.url))

const outputFolder = fileURLToPath(new URL('./output', import.meta.url))

const formatMemoryUsage = (data: number) =>
  `${Math.round((data / 1024 / 1024) * 100) / 100} MB`

function outputMemoryUsage(data: NodeJS.MemoryUsage) {
  return {
    rss: `${formatMemoryUsage(data.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(data.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(data.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(data.external)} -> V8 external memory`,
  }
}

function readFile(filePath: string): Promise<string> {
  return fs
    .readFile(path.resolve(graphqlFolder, filePath))
    .then((v) => v.toString())
}

export function mergeGraphQLFiles(directory: string) {
  // Get an array of all files in the directory
  const files = readdirSync(directory)

  // Filter only .graphql files
  const graphqlFiles = files.filter((file) => file.endsWith('.graphql'))

  // Read each file and join them together into one string
  const mergedSchema = graphqlFiles
    .map((file) => readFileSync(path.join(directory, file), 'utf8'))
    .join('\n')

  return mergedSchema
}

function cleanGraphqlDocument(document: DocumentNode): DocumentNode {
  const found: Set<string> = new Set()

  // Create a new document with modifications
  const cleanedDoc = {
    ...document,
    definitions: document.definitions.filter((def) => {
      if (def.kind !== 'FragmentDefinition') {
        return true
      }

      const fragmentName = def.name.value
      if (found.has(fragmentName)) {
        return false
      }

      found.add(fragmentName)
      return true
    }),
  }

  return cleanedDoc
}

async function runWithDuration(
  fileName: string,
  cb: () => Promise<string> | string,
): Promise<string> {
  console.log('-'.repeat(80))
  console.log('Starting ' + fileName)
  const usageStart = process.memoryUsage()
  console.log(outputMemoryUsage(usageStart))
  const start = performance.now()
  const result = await cb()
  const end = performance.now()
  const usageEnd = process.memoryUsage()
  console.log(outputMemoryUsage(usageEnd))
  console.log('Duration: ' + Math.round((end - start) * 1000) / 1000 + 'ms')
  console.log('-'.repeat(80))
  if (isProfiling) {
    return ''
  }
  const destRaw = path.resolve(outputFolder, fileName + '.ts')
  await fs.writeFile(destRaw, result)
  const destFormatted = path.resolve(outputFolder, fileName + '-formatted.ts')
  const formatted = await format(result)
  await fs.writeFile(destFormatted, formatted)
  return formatted
}

async function main(): Promise<void> {
  const schemaFile = await readFile('schema.graphql')
  const schema = await loadSchema(schemaFile, {
    loaders: [],
    noLocation: true,
  })
  const documentFileAll = mergeGraphQLFiles(
    path.resolve(graphqlFolder, './documents/all'),
  )
  const documentFileSingle = await readFile(
    //   // path.resolve(graphqlFolder, './documents/paragraphs.graphql'),
    //   // path.resolve(graphqlFolder, './documents/merge-typenames.graphql'),
    // path.resolve(graphqlFolder, './documents/merge-fields-typename.graphql'),
    path.resolve(graphqlFolder, './documents/nullability.graphql'),
    //   path.resolve(graphqlFolder, './documents/spread-interface.graphql'),
  )

  const ALL = true

  const documentFile = ALL ? documentFileAll : documentFileSingle
  // const documentFile = TEST
  // const document = parse(documentFile, {
  //     noLocation: false,
  //   })
  const document = parse(documentFile, {
    noLocation: false,
  })
  const documentCleaned = cleanGraphqlDocument(document)
  const documentCleanedString = print(documentCleaned)

  const generator = new Generator(schema, {
    debugMode: true,
    useCache: true,
    dependencyTracking: true,
    output: {
      mergeTypenames: true,
      nonOptionalTypename: false,
      typeComment: true,
    },
  })

  await runWithDuration('custom', () => {
    generator.add(documentCleaned)
    return generator.build().getAll()
  })

  if (isProfiling) {
    return
  }

  await runWithDuration('result-codegen', () => {
    return generateCodegen(schemaFile, documentCleanedString)
  })
}

main()
