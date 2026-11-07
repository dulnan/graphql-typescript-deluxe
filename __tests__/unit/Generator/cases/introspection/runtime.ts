import type {
  RootFragmentQuery,
  SchemaTypesQuery,
  TypeByNameQuery,
} from './result'

export default function (
  schemaTypes: SchemaTypesQuery,
  typeByName: TypeByNameQuery,
  rootFragment: RootFragmentQuery,
): void {
  // __schema is non-null.
  const typeNames = schemaTypes.__schema.types.map((type) => type.name)
  console.log(typeNames)

  // __type is nullable.
  // @ts-expect-error __type is nullable.
  console.log(typeByName.__type.kind)

  if (typeByName.__type?.kind === 'OBJECT') {
    const typename: '__Type' = typeByName.__type.__typename
    console.log(typename)
  }

  // Aliased __type.
  console.log(typeByName.user?.name)

  // __schema from a fragment on the query type.
  console.log(rootFragment.__schema.queryType.name)
}
