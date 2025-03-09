import { codegen } from '@graphql-codegen/core'
import { parse } from 'graphql'
import { loadSchema } from '@graphql-tools/load'
import * as PluginTypescriptOperations from '@graphql-codegen/typescript-operations'
import * as PluginTypescript from '@graphql-codegen/typescript'
import { type TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'

const config: TypeScriptDocumentsPluginConfig = {
  exportFragmentSpreadSubTypes: false,
  preResolveTypes: false,
  skipTypeNameForRoot: true,
  skipTypename: true,
  useTypeImports: true,
  onlyOperationTypes: false,
  namingConvention: {
    enumValues: 'change-case-all#upperCaseFirst',
  },
}

export async function generateCodegen(
  schemaContent: string,
  documents: string,
): Promise<string> {
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
