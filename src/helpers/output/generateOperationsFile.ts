import type { GeneratorOutputCode } from '../../classes/GeneratorOutputCode'
import { GeneratorOutputFile } from '../../classes/GeneratorOutputFile'
import { MinifyVariableName } from '../../classes/MinifyVariableName'
import { LogicError, NodeLocMissingError } from '../../errors'
import { compareNames, graphqlToString } from './../string'
import { notNullish } from './../type'

export type GenerateOperationsFileOptions = {
  minify?: boolean
  exportName?: string
}

export function generateOperationsFile(
  codes: GeneratorOutputCode[],
  options?: GenerateOperationsFileOptions,
): GeneratorOutputFile {
  const shouldMinify = options?.minify ?? true
  const exportName = options?.exportName ?? 'operations'
  const query: string[] = []
  const mutation: string[] = []
  const subscription: string[] = []

  const variableMinifier = new MinifyVariableName(shouldMinify)

  const fragments: { name: string; source: string }[] = []
  for (const code of codes) {
    if (code.type === 'fragment') {
      if (!notNullish(code.source)) {
        throw new NodeLocMissingError(code.graphqlName || code.name)
      }
      if (!code.graphqlName) {
        throw new LogicError('Missing graphqlName for fragment.')
      }
      fragments.push({ name: code.graphqlName, source: code.source })
    }
  }

  // Sorted by name, so that the minified names and their order don't depend
  // on the order in which the code was generated.
  fragments.sort((a, b) => compareNames(a.name, b.name))
  const declarations = fragments
    .map(
      (fragment) =>
        `const ${variableMinifier.getVarName(fragment.name)} = ${graphqlToString(fragment.source, shouldMinify)};`,
    )
    .join('\n')

  for (const code of codes) {
    if (code.type === 'operation') {
      if (!notNullish(code.source)) {
        throw new NodeLocMissingError(code.graphqlName || code.name)
      }

      const fragmentDependencies = code
        .getGraphQLFragmentDependencies()
        .sort(compareNames)
        .map((v) => variableMinifier.getVarName(v))

      let parts = [
        graphqlToString(code.source, shouldMinify),
        ...fragmentDependencies,
      ].join(' + ')
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

  const source = `${declarations}

export const ${exportName} = {
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
