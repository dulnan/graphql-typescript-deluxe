import { beforeAll, describe, expect, it } from 'vitest'
import path from 'node:path'
import { parse, type GraphQLSchema } from 'graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { Generator } from '../../../../src/classes/Generator'
import schemaContent from '../schema.graphql?raw'
import { OPTION_SETS } from '../optionSets'
import { TEST_CASES } from '../testCases'
import { buildChecks, buildFragmentChecks } from './responses'
import { typecheck } from './typecheck'

/**
 * How many responses are created per operation. With more, the cases find the
 * same bugs.
 */
const SAMPLES = 40

/**
 * How many errors are shown per case.
 */
const MAX_ERRORS = 10

const schemas = new Map<string, GraphQLSchema>()

function getSchema(content: string): GraphQLSchema {
  let schema = schemas.get(content)
  if (!schema) {
    schema = loadSchemaSync(content, { loaders: [] })
    schemas.set(content, schema)
  }
  return schema
}

/**
 * The name of the declaration that contains the line, or that follows the
 * comment on the line.
 */
function getDeclarationName(lines: string[], line: number): string {
  const start = lines[line]?.startsWith('//') ? line + 1 : line
  for (let i = start; i >= 0; i--) {
    const match = lines[i]?.match(/^export const (\w+)/)
    if (match) {
      return match[1]!
    }
  }
  return ''
}

/**
 * Build the check files of every case with the output options, type-check
 * them, and return the errors by case name.
 */
function checkCases(
  optionSet: (typeof OPTION_SETS)[number],
  root: string,
): Map<string, string[]> {
  const errors = new Map<string, string[]>()
  const files = new Map<string, string>()

  for (const testCase of TEST_CASES) {
    const caseErrors: string[] = []
    errors.set(testCase.name, caseErrors)
    const dir = `${root}/${testCase.name}`
    try {
      const schema = getSchema(testCase.schema ?? schemaContent)
      const document = parse(testCase.document, { noLocation: false })
      const generator = new Generator(schema, {
        ...testCase.options,
        output: { ...testCase.options.output, ...optionSet.output },
      })
      generator.add({ documentNode: document, filePath: './test.graphql' })
      const output = generator.build()
      const checks = buildChecks(
        schema,
        document,
        output,
        optionSet.output,
        SAMPLES,
      )
      const fragmentChecks = buildFragmentChecks(
        schema,
        document,
        output,
        optionSet.output,
        SAMPLES,
      )
      checks.responses.push(...fragmentChecks.responses)
      checks.errors.push(...fragmentChecks.errors)
      caseErrors.push(...checks.errors)
      files.set(`${dir}/result.ts`, output.getOperations('ts').getSource())
      for (const [name, lines] of [
        ['responses', checks.responses],
        ['variables', checks.variables],
      ] as const) {
        if (lines.length) {
          files.set(
            `${dir}/${name}.ts`,
            [`import type * as T from './result'`, ...lines].join('\n\n'),
          )
        }
      }
    } catch (e) {
      caseErrors.push(String(e))
    }
  }

  // The same error is usually in many responses, so it's shown once, keyed by
  // its innermost reason without the type of the response.
  const grouped = new Map<string, { message: string; count: number }>()
  for (const diagnostic of typecheck(files)) {
    const relative = path.relative(root, diagnostic.fileName)
    const [caseName = '', fileName = ''] = relative.split(path.sep)
    const reason = (diagnostic.message.split('\n').at(-1) ?? '')
      .trim()
      .replace(/'\(?\{[^']*'/g, "'{…}'")
    const key = `${caseName} ${reason}`
    const group = grouped.get(key)
    if (group) {
      group.count++
      continue
    }
    const lines = files.get(diagnostic.fileName)?.split('\n') ?? []
    const location = [
      `${fileName}:${diagnostic.line + 1}`,
      getDeclarationName(lines, diagnostic.line),
    ]
      .filter(Boolean)
      .join(' ')
    grouped.set(key, {
      message: `${location}: ${diagnostic.message}\n${lines[diagnostic.line]?.trim()}`,
      count: 1,
    })
  }

  for (const [key, { message, count }] of grouped) {
    const caseName = key.split(' ')[0]!
    errors
      .get(caseName)
      ?.push(count > 1 ? `${message}\n(and ${count - 1} more)` : message)
  }

  return errors
}

/**
 * Check that the generated types fit real responses, with one option set:
 * Every operation of a case is executed with random responses and variables,
 * and every fragment is spread in a field of its type condition. The
 * responses are assigned to the generated types and type-checked.
 *
 * Each option set has its own test file, because vitest only runs files in
 * parallel.
 *
 * @param setNumber - The number of the option set, starting at 1.
 */
export function describeSoundness(setNumber: number): void {
  const optionSet = OPTION_SETS[setNumber - 1]
  if (!optionSet) {
    throw new Error(`There is no option set ${setNumber}.`)
  }

  describe('Soundness', () => {
    describe(optionSet.label, () => {
      let errors = new Map<string, string[]>()

      beforeAll(() => {
        errors = checkCases(optionSet, `/soundness/set${setNumber}`)
      })

      it.each(TEST_CASES.map((v) => v.name))('%s', (name) => {
        const caseErrors = errors.get(name) ?? []
        expect(
          caseErrors.slice(0, MAX_ERRORS),
          `${caseErrors.length} errors`,
        ).toEqual([])
      })
    })
  })
}
