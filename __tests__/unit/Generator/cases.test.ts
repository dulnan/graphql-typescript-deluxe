import { describe, expect, it } from 'vitest'
import {
  isInterfaceType,
  isObjectType,
  isUnionType,
  NoUnusedFragmentsRule,
  parse,
  specifiedRules,
  validate,
  validateSchema,
  type GraphQLSchema,
} from 'graphql'
import { Generator } from '../../../src/classes/Generator'
import schemaContent from './schema.graphql?raw'
import { generateCodegen } from './../../../helpers/generateCodegen'
import type { GeneratorOptions } from '../../../src/types/options'
import type { GeneratorOutput } from '../../../src/classes/GeneratorOutput'
import { loadSchemaSync } from '@graphql-tools/load'
import { OPTION_SETS } from './optionSets'
import { TEST_CASES } from './testCases'

const defaultSchema = loadSchemaSync(schemaContent, {
  loaders: [],
  noLocation: false,
})

const isWatch = process.env.WATCH_MODE === 'true'

function getSchema(customSchemaContents?: string | null): GraphQLSchema {
  return customSchemaContents
    ? loadSchemaSync(customSchemaContents, { loaders: [] })
    : defaultSchema
}

function generateOutput(
  documents: string,
  customSchemaContents?: string | null,
  options?: GeneratorOptions,
): GeneratorOutput {
  const schema = getSchema(customSchemaContents)
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
 * Find the names of object, interface and union types that are used as an
 * identifier in the code, outside of comments and strings.
 */
function findSchemaTypeNames(code: string, schema: GraphQLSchema): string[] {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'[^']*'|"[^"]*"/g, "''")
  const identifiers = new Set(stripped.match(/[A-Za-z_$][\w$]*/g))
  return Object.values(schema.getTypeMap())
    .filter((v) => isObjectType(v) || isInterfaceType(v) || isUnionType(v))
    .map((v) => v.name)
    .filter((name) => identifiers.has(name))
}

/**
 * A document of fragments without an operation leaves them all unused.
 */
const fragmentRules = specifiedRules.filter((v) => v !== NoUnusedFragmentsRule)

/**
 * Validate a document and return each error message, followed by the document.
 */
function getValidationErrors(
  schema: GraphQLSchema,
  document: string,
  rules = specifiedRules,
): string[] {
  return validate(schema, parse(document), rules).map(
    (v) => `${v.message}\n\n${document}`,
  )
}

/**
 * The documents in the operations file.
 */
function getOperationsFileDocuments(output: GeneratorOutput): string[] {
  const file = output.getOperationsFile().getSource()
  const operations = new Function(
    file.replace('export const operations =', 'return'),
  )() as Record<string, Record<string, string>>
  return Object.values(operations).flatMap((v) => Object.values(v))
}

/**
 * Validate the documents in the operations file and the documents of all
 * operations and fragments.
 */
function getDocumentErrors(
  schema: GraphQLSchema,
  output: GeneratorOutput,
): string[] {
  const operations = [
    ...getOperationsFileDocuments(output),
    ...output
      .getCollectedOperations()
      .map((v) => output.getOperationDocumentWithFragments(v.graphqlName)),
  ]
  const fragments = output
    .getFragments()
    .map((v) => output.getFragmentDocumentWithFragments(v.node.name.value))
  return [
    ...operations.flatMap((v) => getValidationErrors(schema, v)),
    ...fragments.flatMap((v) => getValidationErrors(schema, v, fragmentRules)),
  ]
}

/**
 * The operations file and the documents of all operations and fragments.
 */
function getDocuments(output: GeneratorOutput): string[] {
  return [
    output.getOperationsFile().getSource(),
    ...output
      .getCollectedOperations()
      .map((v) => output.getOperationDocumentWithFragments(v.graphqlName)),
    ...output
      .getFragments()
      .map((v) => output.getFragmentDocumentWithFragments(v.node.name.value)),
  ]
}

/**
 * Check that the output is the same with and without cache and dependency
 * tracking, and that every typename type is named by buildTypenameTypeName.
 */
function checkOutput(
  query: string,
  customSchema: string | null,
  options: GeneratorOptions,
  label: string,
): void {
  const output = generateOutput(query, customSchema, {
    ...options,
    useCache: false,
  })
  const result = output.getOperations('ts').getSource()

  expect(
    generate(query, customSchema, { ...options, useCache: true }),
    `${label}: The cached and uncached output must be identical.`,
  ).toEqual(result)

  const outputWithoutTracking = generateOutput(query, customSchema, {
    ...options,
    dependencyTracking: false,
  })
  expect(
    outputWithoutTracking.getOperations('ts').getSource(),
    `${label}: The output without dependency tracking must be identical.`,
  ).toEqual(result)
  expect(
    getDocuments(outputWithoutTracking),
    `${label}: The documents without dependency tracking must be identical.`,
  ).toEqual(getDocuments(output))

  // The names of the typename types come from buildTypenameTypeName, so no
  // schema type name may be used directly.
  const resultWithRenamedTypenames = generate(query, customSchema, {
    ...options,
    buildTypenameTypeName: (type): string => type.name + 'Typename',
  })
  expect(
    findSchemaTypeNames(resultWithRenamedTypenames, getSchema(customSchema)),
    `${label}: Schema type names used directly instead of buildTypenameTypeName.`,
  ).toEqual([])
}

describe('Generator', () => {
  for (const testCase of TEST_CASES) {
    it(`handles case "${testCase.name}"`, async () => {
      const { document: query, schema: customSchema } = testCase
      const baseOptions: GeneratorOptions = {
        output: {
          nullableField: 'optional',
          nonOptionalTypename: false,
          mergeTypenames: true,
          ...testCase.options.output,
        },
      }

      const output = generateOutput(query, customSchema, {
        ...baseOptions,
        useCache: false,
      })
      await expect(output.getOperations('ts').getSource()).toMatchFileSnapshot(
        `${testCase.folder}/result.ts`,
      )

      // The schema, the case document and every generated document must be
      // valid. The documents don't depend on the output options.
      const schema = getSchema(customSchema)
      expect(validateSchema(schema).map((v) => v.message)).toEqual([])
      expect(getValidationErrors(schema, query, fragmentRules)).toEqual([])
      expect(getDocumentErrors(schema, output)).toEqual([])

      checkOutput(query, customSchema, baseOptions, 'The case options')

      // Also with the other values of the options that change the types.
      for (const optionSet of OPTION_SETS) {
        checkOutput(
          query,
          customSchema,
          {
            ...baseOptions,
            output: { ...baseOptions.output, ...optionSet.output },
          },
          optionSet.label,
        )
      }

      // Only generate codegen comparison in watch mode
      if (isWatch) {
        const codegenSchemaContent = customSchema ?? schemaContent
        const resultCodegen = await generateCodegen(codegenSchemaContent, query)
        // eslint-disable-next-line vitest/no-conditional-expect -- environment-based conditional
        await expect(resultCodegen).toMatchFileSnapshot(
          `${testCase.folder}/result-codegen.ts`,
        )
      }
    })
  }
})
