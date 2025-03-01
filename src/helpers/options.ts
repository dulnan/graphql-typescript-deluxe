import type {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  FragmentDefinitionNode,
  GraphQLNamedType,
} from 'graphql'
import type { GeneratorOptions } from '../types/options'
import { makeComment, toPascalCase } from './string'
import type { DeepRequired } from './type'

export function buildOperationTypeName(
  operationName: string,
  rootType: GraphQLNamedType,
): string {
  return toPascalCase(operationName) + rootType.name
}

export function buildOperationVariablesTypeName(
  operationName: string,
  rootType: GraphQLNamedType,
): string {
  return buildOperationTypeName(operationName, rootType) + 'Variables'
}

export function buildFragmentTypeName(node: FragmentDefinitionNode): string {
  return toPascalCase(node.name.value) + 'Fragment'
}

export function buildInputTypeName(type: GraphQLInputObjectType): string {
  return toPascalCase(type.name) + 'Input'
}

export function buildEnumTypeName(type: GraphQLEnumType): string {
  return toPascalCase(type.name)
}

export function buildScalarType(
  type: GraphQLScalarType,
): string | undefined | null {
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
  nameInCode: string,
  type: GraphQLEnumType,
): string {
  const enumValues = type.getValues()
  const enumEntries = enumValues
    .map((value) => {
      const description = value.description
        ? makeComment(value.description) + '\n'
        : ''
      return `${description}${value.name}: '${value.name}'`
    })
    .join(',\n')

  return `
export const ${nameInCode} = {
${enumEntries}
} as const;
export type ${nameInCode} = (typeof ${nameInCode})[keyof typeof ${nameInCode}];
`.trim()
}

export function buildOptions(
  options?: GeneratorOptions,
): DeepRequired<GeneratorOptions> {
  return {
    debugMode: !!options?.debugMode,
    useCache: options?.useCache ?? false,
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
    dependencyTracking: options?.dependencyTracking ?? true,
    buildScalarType: options?.buildScalarType ?? buildScalarType,

    output: {
      nullableField: options?.output?.nullableField || 'optional',
      arrayShape: options?.output?.arrayShape || 'Array',
      emptyObject: options?.output?.emptyObject ?? 'object',
      nonOptionalTypename: options?.output?.nonOptionalTypename ?? false,
      mergeTypenames: options?.output?.mergeTypenames ?? true,
      typeComment: options?.output?.typeComment ?? true,
    },
  }
}
