import { describe, it, expect } from 'vitest'
import {
  buildOperationTypeName,
  buildOperationVariablesTypeName,
  buildFragmentTypeName,
  buildEnumTypeName,
  buildOptions,
  buildEnumCode,
  buildInputTypeName,
  buildScalarType,
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

      expect(options).toEqual({
        debugMode: false,
        useCache: false,
        dependencyTracking: true,
        generateOperationsMap: false,
        buildOperationTypeName,
        buildOperationVariablesTypeName,
        buildFragmentTypeName,
        buildEnumTypeName,
        buildEnumCode,
        buildInputTypeName,
        buildScalarType,
        output: {
          typeComment: true,
          mergeTypenames: true,
          nonOptionalTypename: false,
          arrayShape: 'Array',
          emptyObject: 'object',
          nullableField: 'optional',
        },
      })
    })

    it('should merge provided options with defaults', () => {
      const customBuildOperationTypeName = (): string => 'Custom'
      const customBuildScalarType = (): string => 'any'
      const options = buildOptions({
        debugMode: true,
        useCache: false,
        dependencyTracking: false,
        generateOperationsMap: true,
        buildOperationTypeName: customBuildOperationTypeName,
        buildScalarType: customBuildScalarType,
        output: {
          emptyObject: 'type',
          typeComment: false,
          mergeTypenames: false,
          nonOptionalTypename: true,
          arrayShape: '[]',
          nullableField: 'null',
        },
      })

      expect(options).toEqual({
        debugMode: true,
        useCache: false,
        dependencyTracking: false,
        generateOperationsMap: true,
        buildOperationTypeName: customBuildOperationTypeName,
        buildOperationVariablesTypeName,
        buildFragmentTypeName,
        buildEnumTypeName,
        buildEnumCode,
        buildInputTypeName,
        buildScalarType: customBuildScalarType,
        output: {
          emptyObject: 'type',
          typeComment: false,
          mergeTypenames: false,
          nonOptionalTypename: true,
          arrayShape: '[]',
          nullableField: 'null',
        },
      })
    })
  })
})
