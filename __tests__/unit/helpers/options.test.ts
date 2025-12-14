import { describe, it, expect } from 'vitest'
import {
  buildOperationTypeName,
  buildOperationVariablesTypeName,
  buildFragmentTypeName,
  buildEnumTypeName,
  buildOptions,
  buildEnumCode,
  buildInputTypeName,
  mapTypeCommentOptions,
} from './../../../src/helpers/options.js'
import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInputObjectType,
} from 'graphql'

describe('Generator Options', () => {
  describe('buildOperationTypeName', () => {
    it('should convert operation name to PascalCase and append root type name', () => {
      const rootType = new GraphQLObjectType({
        name: 'Query',
        fields: {},
      })

      expect(buildOperationTypeName('get_user', rootType)).toBe('GetUserQuery')
      expect(buildOperationTypeName('createPost', rootType)).toBe(
        'CreatePostQuery',
      )
      expect(buildOperationTypeName('UPDATE_SETTINGS', rootType)).toBe(
        'UpdateSettingsQuery',
      )
    })
  })

  describe('buildOperationVariablesTypeName', () => {
    it('should build variables type name based on operation name', () => {
      const rootType = new GraphQLObjectType({
        name: 'Mutation',
        fields: {},
      })

      expect(buildOperationVariablesTypeName('create_user', rootType)).toBe(
        'CreateUserMutationVariables',
      )
      expect(buildOperationVariablesTypeName('updatePost', rootType)).toBe(
        'UpdatePostMutationVariables',
      )
      expect(buildOperationVariablesTypeName('DELETE_COMMENT', rootType)).toBe(
        'DeleteCommentMutationVariables',
      )
    })
  })

  describe('buildFragmentTypeName', () => {
    it('should convert fragment name to PascalCase and append Fragment suffix', () => {
      const fragmentNode = {
        kind: 'FragmentDefinition',
        name: { value: 'user_details' },
      } as any

      expect(buildFragmentTypeName(fragmentNode)).toBe('UserDetailsFragment')
    })

    it('should handle already PascalCase fragment names', () => {
      const fragmentNode = {
        kind: 'FragmentDefinition',
        name: { value: 'UserProfile' },
      } as any

      expect(buildFragmentTypeName(fragmentNode)).toBe('UserProfileFragment')
    })
  })

  describe('buildEnumTypeName', () => {
    it('should convert enum name to PascalCase', () => {
      const enumType = new GraphQLEnumType({
        name: 'USER_STATUS',
        values: {
          ACTIVE: { value: 'ACTIVE' },
          INACTIVE: { value: 'INACTIVE' },
        },
      })

      expect(buildEnumTypeName(enumType)).toBe('UserStatus')
    })
  })

  describe('buildOptions', () => {
    it('should return default options when no options provided', () => {
      const options = buildOptions()

      expect(options.debugMode).toEqual(false)
      expect(options.useCache).toEqual(false)
      expect(options.dependencyTracking).toEqual(true)
      expect(options.skipUnusedFragments).toEqual(false)
      expect(options.buildOperationTypeName).toEqual(buildOperationTypeName)
      expect(options.buildOperationVariablesTypeName).toEqual(
        buildOperationVariablesTypeName,
      )
      expect(options.buildFragmentTypeName).toEqual(buildFragmentTypeName)
      expect(options.buildEnumTypeName).toEqual(buildEnumTypeName)
      expect(options.buildEnumCode).toEqual(buildEnumCode)
      expect(options.buildInputTypeName).toEqual(buildInputTypeName)
      expect(options.output.typeComment).toEqual(true)
      expect(options.output.mergeTypenames).toEqual(true)
      expect(options.output.nonOptionalTypename).toEqual(false)
      expect(options.output.arrayShape).toEqual('$T$[]')
      expect(options.output.nullableArrayElements).toEqual(true)
      expect(options.output.emptyObject).toEqual('object')
      expect(options.output.nullableField).toEqual('optional')
      expect(options.output.formatCode).toEqual(true)
    })

    it('should merge provided options with defaults', () => {
      const customBuildOperationTypeName = (): string => 'Custom'
      const options = buildOptions({
        debugMode: true,
        useCache: false,
        dependencyTracking: false,
        skipUnusedFragments: true,
        buildOperationTypeName: customBuildOperationTypeName,
        output: {
          emptyObject: 'type',
          typeComment: false,
          mergeTypenames: false,
          nonOptionalTypename: true,
          nullableArrayElements: false,
          arrayShape: 'MyCustomArray<$T$>',
          nullableField: 'null',
          formatCode: false,
        },
      })

      expect(options.debugMode).toEqual(true)
      expect(options.useCache).toEqual(false)
      expect(options.dependencyTracking).toEqual(false)
      expect(options.skipUnusedFragments).toEqual(true)

      expect(options.output.emptyObject).toEqual('type')
      expect(options.output.typeComment).toEqual(false)
      expect(options.output.mergeTypenames).toEqual(false)
      expect(options.output.nonOptionalTypename).toEqual(true)
      expect(options.output.nullableArrayElements).toEqual(false)
      expect(options.output.arrayShape).toEqual('MyCustomArray<$T$>')
      expect(options.output.nullableField).toEqual('null')
      expect(options.output.formatCode).toEqual(false)
    })

    it('should throw error when arrayShape is missing $T$ placeholder', () => {
      expect(() =>
        buildOptions({
          output: {
            arrayShape: 'Array<string>',
          },
        }),
      ).toThrow(
        'The output.arrayShape option value is missing the $T$ placeholder.',
      )
    })

    it('should use default buildScalarType for standard GraphQL scalars', () => {
      const options = buildOptions()

      // Test ID scalar
      const idType = new GraphQLScalarType({ name: 'ID' })
      expect(options.buildScalarType(idType)).toBe('string | number')

      // Test String scalar
      const stringType = new GraphQLScalarType({ name: 'String' })
      expect(options.buildScalarType(stringType)).toBe('string')

      // Test Boolean scalar
      const booleanType = new GraphQLScalarType({ name: 'Boolean' })
      expect(options.buildScalarType(booleanType)).toBe('boolean')

      // Test Int scalar
      const intType = new GraphQLScalarType({ name: 'Int' })
      expect(options.buildScalarType(intType)).toBe('number')

      // Test Float scalar
      const floatType = new GraphQLScalarType({ name: 'Float' })
      expect(options.buildScalarType(floatType)).toBe('number')

      // Test unknown scalar returns null
      const customType = new GraphQLScalarType({ name: 'DateTime' })
      expect(options.buildScalarType(customType)).toBe(null)
    })

    it('should use custom buildScalarType when provided', () => {
      const options = buildOptions({
        buildScalarType: (type) => {
          if (type.name === 'DateTime') {
            return 'Date'
          }
          if (type.name === 'JSON') {
            return 'Record<string, unknown>'
          }
          return null
        },
      })

      // Custom scalar should use custom type
      const dateTimeType = new GraphQLScalarType({ name: 'DateTime' })
      expect(options.buildScalarType(dateTimeType)).toBe('Date')

      const jsonType = new GraphQLScalarType({ name: 'JSON' })
      expect(options.buildScalarType(jsonType)).toBe('Record<string, unknown>')

      // Standard scalar should still work (fallback)
      const stringType = new GraphQLScalarType({ name: 'String' })
      expect(options.buildScalarType(stringType)).toBe('string')

      // Unknown scalar returns null from custom function, then null from default
      const unknownType = new GraphQLScalarType({ name: 'Unknown' })
      expect(options.buildScalarType(unknownType)).toBe(null)
    })

    it('should use default buildTypeDocFilePath', () => {
      const options = buildOptions()
      expect(options.output.buildTypeDocFilePath('/path/to/file.ts')).toBe(
        '/path/to/file.ts',
      )
    })

    it('should use custom buildTypeDocFilePath when provided', () => {
      const options = buildOptions({
        output: {
          buildTypeDocFilePath: (filePath) => `file://${filePath}`,
        },
      })
      expect(options.output.buildTypeDocFilePath('/path/to/file.ts')).toBe(
        'file:///path/to/file.ts',
      )
    })

    it('should use default additionalOutputCode', () => {
      const options = buildOptions()
      expect(options.additionalOutputCode()).toEqual([])
    })

    it('should use custom additionalOutputCode when provided', () => {
      const customCode = [
        {
          id: 'custom-1',
          type: 'helpers' as const,
          name: 'FOO',
          code: { ts: 'export const FOO = 1;' },
        },
      ]
      const options = buildOptions({
        additionalOutputCode: () => customCode,
      })
      expect(options.additionalOutputCode()).toEqual(customCode)
    })

    it('should use sortProperties default value', () => {
      const options = buildOptions()
      expect(options.output.sortProperties).toBe(true)
    })

    it('should allow overriding sortProperties', () => {
      const options = buildOptions({
        output: {
          sortProperties: false,
        },
      })
      expect(options.output.sortProperties).toBe(false)
    })
  })

  describe('buildInputTypeName', () => {
    it('should convert input type name to PascalCase', () => {
      const inputType = new GraphQLInputObjectType({
        name: 'create_user_input',
        fields: {},
      })
      expect(buildInputTypeName(inputType)).toBe('CreateUserInput')
    })
  })

  describe('buildEnumCode', () => {
    it('should generate enum code with descriptions', () => {
      const enumType = new GraphQLEnumType({
        name: 'Status',
        values: {
          ACTIVE: { value: 'ACTIVE', description: 'User is active' },
          INACTIVE: { value: 'INACTIVE' },
        },
      })

      const result = buildEnumCode('Status', enumType)

      // Check JS output
      expect(result.js).toContain('export const Status = Object.freeze({')
      expect(result.js).toContain("ACTIVE: 'ACTIVE'")
      expect(result.js).toContain("INACTIVE: 'INACTIVE'")
      expect(result.js).toContain('/** User is active */')

      // Check TS output
      expect(result.ts).toContain('as const')
      expect(result.ts).toContain("export type Status = 'ACTIVE' | 'INACTIVE'")

      // Check d.ts output
      expect(result['d.ts']).toContain('export declare const Status')
      expect(result['d.ts']).toContain("readonly ACTIVE: 'ACTIVE'")
      expect(result['d.ts']).toContain(
        "export type Status = 'ACTIVE' | 'INACTIVE'",
      )
    })
  })

  describe('mapTypeCommentOptions', () => {
    it('should return all true when option is true', () => {
      const result = mapTypeCommentOptions(true)
      expect(result).toEqual({
        typeDescription: true,
        fieldDescription: true,
        link: true,
        source: true,
      })
    })

    it('should return all false when option is false', () => {
      const result = mapTypeCommentOptions(false)
      expect(result).toEqual({
        typeDescription: false,
        fieldDescription: false,
        link: false,
        source: false,
      })
    })

    it('should return all true when option is undefined (default)', () => {
      const result = mapTypeCommentOptions()
      expect(result).toEqual({
        typeDescription: true,
        fieldDescription: true,
        link: true,
        source: true,
      })
    })

    it('should handle array of specific options', () => {
      const result = mapTypeCommentOptions(['typeDescription', 'link'])
      expect(result).toEqual({
        typeDescription: true,
        fieldDescription: false,
        link: true,
        source: false,
      })
    })

    it('should handle array with all options', () => {
      const result = mapTypeCommentOptions([
        'typeDescription',
        'fieldDescription',
        'link',
        'source',
      ])
      expect(result).toEqual({
        typeDescription: true,
        fieldDescription: true,
        link: true,
        source: true,
      })
    })

    it('should handle empty array', () => {
      const result = mapTypeCommentOptions([])
      expect(result).toEqual({
        typeDescription: false,
        fieldDescription: false,
        link: false,
        source: false,
      })
    })

    it('should handle array with single option', () => {
      const result = mapTypeCommentOptions(['source'])
      expect(result).toEqual({
        typeDescription: false,
        fieldDescription: false,
        link: false,
        source: true,
      })
    })
  })
})
