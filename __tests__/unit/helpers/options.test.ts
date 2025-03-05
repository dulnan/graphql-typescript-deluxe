import { describe, it, expect } from 'vitest'
import {
  buildOperationTypeName,
  buildOperationVariablesTypeName,
  buildFragmentTypeName,
  buildEnumTypeName,
  buildOptions,
  buildEnumCode,
  buildInputTypeName,
} from './../../../src/helpers/options.js'
import { GraphQLEnumType, GraphQLObjectType } from 'graphql'

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
    })

    it('should merge provided options with defaults', () => {
      const customBuildOperationTypeName = (): string => 'Custom'
      const options = buildOptions({
        debugMode: true,
        useCache: false,
        dependencyTracking: false,
        buildOperationTypeName: customBuildOperationTypeName,
        output: {
          emptyObject: 'type',
          typeComment: false,
          mergeTypenames: false,
          nonOptionalTypename: true,
          nullableArrayElements: false,
          arrayShape: 'MyCustomArray<$T$>',
          nullableField: 'null',
        },
      })

      expect(options.debugMode).toEqual(true)
      expect(options.useCache).toEqual(false)
      expect(options.dependencyTracking).toEqual(false)

      expect(options.output.emptyObject).toEqual('type')
      expect(options.output.typeComment).toEqual(false)
      expect(options.output.mergeTypenames).toEqual(false)
      expect(options.output.nonOptionalTypename).toEqual(true)
      expect(options.output.nullableArrayElements).toEqual(false)
      expect(options.output.arrayShape).toEqual('MyCustomArray<$T$>')
      expect(options.output.nullableField).toEqual('null')
    })
  })
})
