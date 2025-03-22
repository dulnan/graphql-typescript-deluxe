import type {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  FragmentDefinitionNode,
  GraphQLNamedType,
} from 'graphql'
import type { GeneratorOptions, TypeCommentOptions } from '../types/options'
import { makeComment } from './string'
import type { DeepRequired } from './type'
import { InvalidOptionError } from '../errors'
import { pascalCase } from 'change-case'
import type { GeneratedCode, GeneratedCodeByOutputType } from '../types'

export function buildOperationTypeName(
  operationName: string,
  rootType: GraphQLNamedType,
): string {
  return pascalCase(operationName) + rootType.name
}

export function buildOperationVariablesTypeName(
  operationName: string,
  rootType: GraphQLNamedType,
): string {
  return buildOperationTypeName(operationName, rootType) + 'Variables'
}

export function buildFragmentTypeName(node: FragmentDefinitionNode): string {
  return pascalCase(node.name.value) + 'Fragment'
}

export function buildInputTypeName(type: GraphQLInputObjectType): string {
  return pascalCase(type.name)
}

export function buildEnumTypeName(type: GraphQLEnumType): string {
  return pascalCase(type.name)
}

function buildTypeDocFilePath(filePath: string): string {
  return filePath
}

function buildScalarType(type: GraphQLScalarType): string | undefined | null {
  switch (type.name) {
    case 'ID': {
      return 'string | number'
    }
    case 'String': {
      return 'string'
    }
    case 'Boolean': {
      return 'boolean'
    }
    case 'Int':
    case 'Float': {
      return 'number'
    }
  }

  return null
}

export function buildEnumCode(
  name: string,
  type: GraphQLEnumType,
): GeneratedCodeByOutputType {
  const enumValues = type.getValues()

  const enumEntries = enumValues
    .map((value) => {
      const description = value.description
        ? makeComment(value.description) + '\n'
        : ''
      return `${description}${value.name}: '${value.name}'`
    })
    .join(',\n')
  const codeJs = `export const ${name} = {
${enumEntries}
};`

  const strings = enumValues.map((v) => `'${v.name}'`).join(' | ')
  const codeTsType = `export type ${name} = ${strings};`

  const codeTs = `export const ${name} = {
${enumEntries}
} as const;`

  const codeOutputTs = `${codeTs}\n${codeTsType}`

  const enumEntriesReadonly = enumValues
    .map((value) => {
      const description = value.description
        ? makeComment(value.description) + '\n'
        : ''
      return `${description}readonly ${value.name}: '${value.name}'`
    })
    .join(',\n')

  const codeDeclare = `export declare const ${name}: {
${enumEntriesReadonly}
};`

  const codeDts = `${codeDeclare}\n${codeTsType}`

  return {
    js: codeJs,
    ts: codeOutputTs,
    'd.ts': codeDts,
  }
}

export function buildOptions(
  options?: GeneratorOptions,
): DeepRequired<GeneratorOptions> {
  const arrayShape = options?.output?.arrayShape ?? '$T$[]'
  if (!arrayShape.includes('$T$')) {
    throw new InvalidOptionError(
      'The output.arrayShape option value is missing the $T$ placeholder.',
    )
  }
  return {
    debugMode: !!options?.debugMode,
    useCache: options?.useCache ?? false,
    dependencyTracking: options?.dependencyTracking ?? true,
    skipUnusedFragments: options?.skipUnusedFragments ?? false,
    additionalOutputCode:
      options?.additionalOutputCode ?? ((): GeneratedCode[] => []),
    buildOperationTypeName:
      options?.buildOperationTypeName ?? buildOperationTypeName,
    buildOperationVariablesTypeName:
      options?.buildOperationVariablesTypeName ??
      buildOperationVariablesTypeName,
    buildFragmentTypeName:
      options?.buildFragmentTypeName ?? buildFragmentTypeName,
    buildEnumTypeName: options?.buildEnumTypeName ?? buildEnumTypeName,
    buildEnumCode: options?.buildEnumCode ?? buildEnumCode,
    buildInputTypeName: options?.buildInputTypeName ?? buildInputTypeName,
    buildScalarType: (type: GraphQLScalarType): string | null | undefined => {
      // Generate custom.
      if (options?.buildScalarType) {
        const customType = options.buildScalarType(type)
        if (customType) {
          return customType
        }
      }

      // Fallback.
      return buildScalarType(type)
    },

    output: {
      nullableField: options?.output?.nullableField || 'optional',
      arrayShape,
      nullableArrayElements: options?.output?.nullableArrayElements ?? true,
      emptyObject: options?.output?.emptyObject ?? 'object',
      nonOptionalTypename: options?.output?.nonOptionalTypename ?? false,
      mergeTypenames: options?.output?.mergeTypenames ?? true,
      typeComment: options?.output?.typeComment ?? true,
      buildTypeDocFilePath:
        options?.output?.buildTypeDocFilePath ?? buildTypeDocFilePath,
      sortProperties: options?.output?.sortProperties ?? true,
      formatCode: options?.output?.formatCode ?? true,
    },
  }
}

export function mapTypeCommentOptions(
  option: TypeCommentOptions[] | boolean = true,
): Record<TypeCommentOptions, boolean> {
  if (typeof option === 'boolean') {
    return {
      typeDescription: !!option,
      fieldDescription: !!option,
      link: !!option,
      source: !!option,
    }
  }
  return {
    typeDescription: option.includes('typeDescription'),
    fieldDescription: option.includes('fieldDescription'),
    link: option.includes('link'),
    source: option.includes('source'),
  }
}
