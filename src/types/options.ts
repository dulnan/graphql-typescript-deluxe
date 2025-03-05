import type {
  FragmentDefinitionNode,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLScalarType,
  OperationDefinitionNode,
} from 'graphql'
import type { GeneratedCode } from '.'

export type GeneratorOptionsOutput = {
  /**
   * How an "empty object" should be represented.
   *
   * @default "object"
   */
  emptyObject?: string

  /**
   * How a nullable field should be represented.
   *
   * - 'null' produces `{ field: string | null }`
   * - 'optional' produces `{ field?: string }`
   *
   * Note that when using 'optional', the types are technically not correct,
   * since the response will actually contain `null` and never be `undefined`.
   * However it can make the generated types much more readable.
   *
   * @default "optional"
   */
  nullableField?: 'null' | 'optional'

  /**
   * How arrays should be represented.
   *
   * - 'Array<$T$>' results in e.g. `Array<MyFragment>` or `Array<{ label: string }>`
   * - '$T$[]' results in e.g. `MyFragment[]` or `({ label: string } | { url: string })[]`
   *
   * You can also provide any code you want, it must contain the "$T$" placeholder,
   * which is where the generated type is replaced with.
   *
   * @default "Array<$T$>"
   */
  arrayShape?: string

  /**
   * Generate nullable array elements.
   *
   * If true, a `[String]` array in the schema results in `Array<string | null>`.
   * If false, both `[String]` and `[String!]` arrays produce `Array<string>`.
   *
   * Note that the array will contain `null` values unless explicitly removed
   * by the GraphQL client. So only set this to `false` if this is the case.
   *
   * @default true
   */
  nullableArrayElements?: boolean

  /**
   * Force a __typename field on every type.
   *
   * Note that this will significantly increase the size of the file.
   * Ideally this should be used together with the enableTypenameMerging option.
   *
   * @default false
   */
  nonOptionalTypename?: boolean

  /**
   * When enabled, object shapes that contain __typename are merged.
   *
   * This would convert a type like this:
   * ```
   * | { __typename: Document }
   * | { __typename: Image }
   * | { __typename: NodeArticle }
   * | { __typename: User }
   * | { __typename: Comment }
   * | { __typename: NodePage; body: string | null }
   * ```
   *
   * to this instead:
   * ```
   * | { __typename: Exclude<Entity, NodePage> }
   * | { __typename: NodePage; body: string | null }
   * ```
   *
   * This is especially useful if you have interfaces with lots of implementing types.
   * Note that this will create a string literal type for every GraphQL type and a
   * union type for every GraphQL interface and union.
   *
   * @default true
   */
  mergeTypenames?: boolean

  /**
   * Adds additional context for each generated type as a TypeDoc comment,
   * such as the source file path and the source code.
   *
   * Note: If you want the output to contain the source code of operations or
   * fragments the documents must be parsed with `noLocation: false`:
   *
   * ```typescript
   * import { parse } from 'graphql'
   *
   * const node = parse(sourceCode, {
   *   noLocation: false,
   * })
   * ```
   *
   * To include the path to the .graphql file you have to provide the documents
   * as an InputDocument type:
   *
   * ```typescript
   * const documentNode = parse(sourceCode)
   * generator.generateTypes({ documentNode, filePath: './path/to/the/file.graphql' })
   * ```
   *
   * @default true
   */
  typeComment?: boolean
}

export type GeneratorOptions = {
  /**
   * Enable debug mode.
   *
   * @default false
   */
  debugMode?: boolean

  /**
   * Output options.
   */
  output?: GeneratorOptionsOutput

  /**
   * Provide additional, static output code.
   *
   * The method is executed once when the class is initialised. You can add
   * some custom helpers or types here.
   *
   * For example, if you want to provide a custom type for scalars, define the
   * type here:
   *
   * @example
   *
   * ```typescript
   * {
   *   additionalOutputCode: () => {
   *     return [
   *       {
   *         type: 'type-helpers',
   *         name: 'MyCustomScalar',
   *         code: 'type NumberMap = Record<string, number>',
   *       }
   *     ]
   *   }
   * }
   * ```
   *
   * And then tell the Generator to use your custom type for this scalar:
   * ```typescript
   * {
   *   buildScalarType: (type) => {
   *     if (type.name === 'MyCustomScalar') {
   *       // Use your custom type.
   *       return 'NumberMap'
   *     }
   *   }
   * }
   * ```
   *
   * @default () => []
   */
  additionalOutputCode?: () => GeneratedCode[]

  /**
   * Enable caching for intermediate representations of documents.
   *
   * Depending on the size and complexity of the operations and fragments this
   * can make subsequent incremental updates faster. For initial generation it
   * has barely any impact.
   *
   * Use at your own risk. It's recommended to compare the output of both cached
   * and uncached generations to make sure they produce the same output.
   *
   * @experimental
   *
   * @default false
   */
  useCache?: boolean

  /**
   * Enables dependency tracking.
   *
   * If enabled, the generator keeps track of dependencies between input
   * document and their generated types.
   *
   * This allows incremental generation of types, for example when calling the
   * `update()` method.
   *
   * If you don't plan to use incremental generation you can disable this
   * feature.
   *
   * @experimental
   *
   * @default true
   */
  dependencyTracking?: boolean

  /**
   * Build the TS type name for an operation.
   *
   * @param operationName - The name of the operation.
   * @param rootType - The root type from the schema (e.g. Query or Mutation).
   * @param node - The operation definition AST node.
   *
   * @example Defaults to PascalCase of operation name + operation type, e.g.
   * ```graphql
   * query getStatus {
   *   status
   * }
   * ```
   *
   * generates: "GetStatusQuery"
   */
  buildOperationTypeName?:
    | ((
        operationName: string,
        rootType: GraphQLNamedType,
        node: OperationDefinitionNode,
      ) => string)
    | ((operationName: string, rootType: GraphQLNamedType) => string)

  /**
   * Build the TS type name for operation variables.
   *
   * @param operationName - The name of the operation.
   * @param rootType - The root type from the schema (e.g. Query or Mutation).
   * @param node - The operation definition AST node.
   *
   * @example Defaults to PascalCase of operation name + operation type + "Variables", e.g.
   * ```graphql
   * query loadUser($id: String!) {
   *   user(id: $id) {
   *     name
   *   }
   * }
   * ```
   *
   * generates: "LoadUserQueryVariables"
   */
  buildOperationVariablesTypeName?:
    | ((
        operationName: string,
        rootType: GraphQLNamedType,
        node: OperationDefinitionNode,
      ) => string)
    | ((operationName: string, rootType: GraphQLNamedType) => string)

  /**
   * Build the TS type name for a fragment.
   *
   * @param node - The fragment definition node.
   *
   * @example Defaults to PascalCase of fragment name + "Fragment", e.g.:
   * ```graphql
   * fragment blog_post on BlogPost {
   *   title
   * }
   * ```
   *
   * generates: "BlogPostFragment"
   */
  buildFragmentTypeName?: (node: FragmentDefinitionNode) => string

  /**
   * Build the TS type name for an input type.
   *
   * @param type - The input object type from the schema.
   *
   * @example Defaults to PascalCase of fragment name + "Input", e.g.:
   * ```graphqls
   * input ShippingAddress {
   *   street: String!
   *   zipCode: String!
   *   locality: String!
   * }
   * ```
   * generates: "ShippingAddressInput"
   */
  buildInputTypeName?: (type: GraphQLInputObjectType) => string

  /**
   * Build the TS type and const name for an enum.
   *
   * @param type - The enum type from the schema.
   *
   * @example Defaults to PascalCase of enum name, e.g.:
   * ```graphqls
   * enum CONTACT_METHOD {
   *   PHONE
   *   MAIL
   * }
   * ```
   *
   * generates: "ContactMethod"
   */
  buildEnumTypeName?: (type: GraphQLEnumType) => string

  /**
   * Build the full TS code for an enum.
   *
   * @param nameInCode - The name returned by buildEnumTypeName
   * @param type - The enum type from the schema.
   *
   * @example Defaults to creating both a const and type, e.g.:
   * ```graphqls
   * enum CONTACT_METHOD {
   *   PHONE
   *   MAIL
   * }
   * ```
   *
   * Generates:
   *
   * ```typescript
   * export const ContactMethod = {
   *   PHONE: "PHONE",
   *   MAIL: "MAIL",
   * } as const;
   * export type ContactMethod = (typeof ContactMethod)[keyof typeof ContactMethod];
   * ```
   */
  buildEnumCode?: (nameInCode: string, type: GraphQLEnumType) => string

  /**
   * Build the TS output for a scalar type.
   *
   * If the method doesn't return anything, the fallback fill be `any`.
   *
   * Defaults to:
   * - String => string
   * - Boolean => boolean
   * - Int => number
   * - Float => number
   * - ID => string | number
   */
  buildScalarType?: (type: GraphQLScalarType) => string | undefined | null
}
