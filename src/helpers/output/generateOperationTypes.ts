import { OperationTypeNode } from 'graphql'
import { GeneratorOutputFile } from '../../classes/GeneratorOutputFile'
import type { GeneratorOutputOperation } from '../../classes/GeneratorOutputOperation'

export function generateOperationTypes(
  operations: GeneratorOutputOperation[],
  importFrom?: string,
): GeneratorOutputFile {
  const query: string[] = []
  const mutation: string[] = []
  const subscription: string[] = []

  const allImports: string[] = []
  const allDependencies: Set<string> = new Set()

  for (const operation of operations) {
    const line = `${operation.graphqlName}: {\n    response: ${operation.typeName},\n    variables: ${operation.variablesTypeName},\n    needsVariables: ${operation.needsVariables}\n  }`
    operation.dependencyStrings.forEach((key) => {
      if (key.includes('operation')) {
        allDependencies.add(key)
      }
    })
    allImports.push(operation.typeName)
    allImports.push(operation.variablesTypeName)
    if (operation.operationType === OperationTypeNode.QUERY) {
      query.push(line)
    } else if (operation.operationType === OperationTypeNode.MUTATION) {
      mutation.push(line)
    } else if (operation.operationType === OperationTypeNode.SUBSCRIPTION) {
      subscription.push(line)
    }
  }

  const makeExport = (name: string, lines: string[]) => {
    if (!lines.length) {
      return `export type ${name} = {}`
    }
    return `export type ${name} = {
  ${lines.sort().join(';\n  ')}
}`
  }

  let source = `${makeExport('Query', query)}

${makeExport('Mutation', mutation)}

${makeExport('Subscription', subscription)}

export type Operations = {
  query: Query,
  mutation: Mutation,
  subscription: Subscription,
}`

  if (importFrom) {
    source =
      `import type {
  ${allImports.sort().join(',\n  ')}
} from '${importFrom}'\n\n` + source
  }

  return new GeneratorOutputFile(source, [...allDependencies.values()])
}
