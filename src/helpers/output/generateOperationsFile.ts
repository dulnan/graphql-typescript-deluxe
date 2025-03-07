import type { GeneratorOutputCode } from '../../classes/GeneratorOutputCode'
import { GeneratorOutputFile } from '../../classes/GeneratorOutputFile'
import { MinifyVariableName } from '../../classes/MinifyVariableName'
import { LogicError, NodeLocMissingError } from '../../errors'
import { graphqlToString } from './../string'
import { notNullish } from './../type'

export function generateOperationsFile(
  codes: GeneratorOutputCode[],
  shouldMinify = false,
): GeneratorOutputFile {
  const declarations: { name: string; value: string }[] = []
  const query: string[] = []
  const mutation: string[] = []
  const subscription: string[] = []

  const variableMinifier = new MinifyVariableName(shouldMinify)

  for (const code of codes) {
    if (code.type === 'fragment') {
      if (!notNullish(code.source)) {
        throw new NodeLocMissingError(code.graphqlName || code.name)
      }
      if (!code.graphqlName) {
        throw new LogicError('Missing graphqlName for fragment.')
      }
      const varName = variableMinifier.getVarName(code.graphqlName)
      declarations.push({ name: varName, value: code.source })
    } else if (code.type === 'operation') {
      if (!notNullish(code.source)) {
        throw new NodeLocMissingError(code.graphqlName || code.name)
      }

      const fragmentDependencies = code
        .getGraphQLFragmentDependencies()
        .map((v) => variableMinifier.getVarName(v))

      let parts = [graphqlToString(code.source), ...fragmentDependencies].join(
        ' + ',
      )
      if (parts.length > 80 && !shouldMinify) {
        parts = '\n      ' + parts.replaceAll(' + ', ' +\n      ')
      }
      const declaration = `'${code.graphqlName!}': ${parts},`
      if (code.identifier === 'query') {
        query.push(declaration)
      } else if (code.identifier === 'mutation') {
        mutation.push(declaration)
      } else if (code.identifier === 'subscription') {
        subscription.push(declaration)
      }
    }
  }

  const sortedDeclarations = declarations
    .sort((a, b) => a.value.localeCompare(b.value))
    .map((v) => `const ${v.name} = ${graphqlToString(v.value)};`)
    .join('\n')

  const source = `${sortedDeclarations}

export const operations = {
  query: {
    ${query.sort().join('\n    ')}
  },
  mutation: {
    ${mutation.sort().join('\n    ')}
  },
  subscription: {
    ${subscription.sort().join('\n    ')}
  }
}`

  return new GeneratorOutputFile(source, [], 'js')
}
