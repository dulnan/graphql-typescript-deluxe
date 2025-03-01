import { codegen } from '@graphql-codegen/core'
import { parse } from 'graphql'
import { loadSchema } from '@graphql-tools/load'
import * as PluginTypescriptOperations from '@graphql-codegen/typescript-operations'
import * as PluginTypescript from '@graphql-codegen/typescript'
import { type TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'

const config: TypeScriptDocumentsPluginConfig = {
  useTypeImports: true,
  onlyOperationTypes: true,
  namingConvention: {
    enumValues: 'change-case-all#upperCaseFirst',
  },

  enumPrefix: true,
  avoidOptionals: false,
  preResolveTypes: true,
  maybeValue: 'T',
  flattenGeneratedTypes: false,
  exportFragmentSpreadSubTypes: false,
  extractAllFieldsToTypes: false,
  skipTypeNameForRoot: true,
  inlineFragmentTypes: 'combine',
  dedupeFragments: false,
  nonOptionalTypename: false,
  skipTypename: true,
}

export async function generateCodegen(
  schemaContent: string,
  documents: string,
) {
  const schemaAst = await loadSchema(schemaContent, { loaders: [] })
  const schema = parse(schemaContent)
  return codegen({
    filename: '/dev/null/foobar',
    documents: [
      {
        document: parse(documents),
      },
    ],
    schema,
    schemaAst,
    // skipDocumentsValidation: {
    //   ignoreRules: [],
    //   skipDuplicateValidation: true,
    //   skipValidationAgainstSchema: true,
    // },
    config,
    plugins: [
      {
        typescript: {},
      },
      {
        typescriptOperations: {},
      },
    ],
    pluginMap: {
      typescript: PluginTypescript,
      typescriptOperations: PluginTypescriptOperations,
    },
  })
}
