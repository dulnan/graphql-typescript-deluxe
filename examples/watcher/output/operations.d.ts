
export type Query = {
  fieldMerging: { response: FieldMergingQuery, variables: FieldMergingQueryVariables, needsVariables: false };
  loadEntity: { response: LoadEntityQuery, variables: LoadEntityQueryVariables, needsVariables: false };
  myQuery: { response: MyQueryQuery, variables: MyQueryQueryVariables, needsVariables: false };
  queryWithVariables: { response: QueryWithVariablesQuery, variables: QueryWithVariablesQueryVariables, needsVariables: false }
}

export type Mutation = {
  
}

export type Subscription = {
  
}

export type Operations = {
  query: Query,
  mutation: Mutation,
  subscription: Subscription,
}
