import type {
  GraphQLNamedType,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql'

export function getRootType(
  schema: GraphQLSchema,
  op: OperationDefinitionNode,
): GraphQLNamedType | null {
  switch (op.operation) {
    case 'query':
      return schema.getQueryType() || null
    case 'mutation':
      return schema.getMutationType() || null
    case 'subscription':
      return schema.getSubscriptionType() || null
  }
  return null
}
