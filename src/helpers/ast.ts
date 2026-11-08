import {
  type ArgumentNode,
  type DirectiveNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type InlineFragmentNode,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValueNode,
  print,
} from 'graphql'

/**
 * A node that can have directives, such as a field, a fragment spread or an
 * inline fragment.
 */
type NodeWithDirectives = {
  readonly directives?: readonly DirectiveNode[]
}

function isConditionalDirective(directive: DirectiveNode): boolean {
  const name = directive.name.value
  return name === 'skip' || name === 'include'
}

/**
 * Determines if the node has any of the two default conditional directives.
 */
export function hasConditionalDirective(node: NodeWithDirectives): boolean {
  return !!node.directives?.some(isConditionalDirective)
}

/**
 * Returns the @include and @skip directives of the node.
 */
export function getConditionalDirectives(
  node: NodeWithDirectives,
): DirectiveNode[] {
  return node.directives?.filter(isConditionalDirective) ?? []
}

/**
 * Returns the name of the type an inline fragment applies to.
 *
 * An inline fragment without a type condition, such as
 * `... @include(if: $foo) { id }`, applies to the type of the selection set
 * it is in.
 *
 * @param node - The inline fragment node.
 * @param parentTypeName - The name of the type of the surrounding selection set.
 *
 * @returns The name of the type the inline fragment applies to.
 */
export function getInlineFragmentTypeName(
  node: InlineFragmentNode,
  parentTypeName: string,
): string {
  return node.typeCondition?.name.value ?? parentTypeName
}

export function mergeSameFieldSelections(
  selectionSet: SelectionSetNode,
): SelectionSetNode {
  // 1) Group FIELD nodes by alias (or name if no alias) and by their
  // @include/@skip directives. The merged field node keeps the directives of
  // the first node, so only fields with the same condition can be merged.
  // Fields with different conditions are merged later, when building the IR.
  const fieldMap = new Map<string, FieldNode[]>()
  const otherSelections: (FragmentSpreadNode | InlineFragmentNode)[] = []

  for (const sel of selectionSet.selections) {
    if (sel.kind === Kind.FIELD) {
      const aliasOrName = sel.alias?.value || sel.name.value
      const condition = getConditionalDirectives(sel)
        .map((directive) => print(directive))
        .join(' ')
      const key = aliasOrName + ' ' + condition
      const existing = fieldMap.get(key) ?? []
      existing.push(sel)
      fieldMap.set(key, existing)
    } else {
      // Inline fragments, fragment spreads, etc. do not merge by alias
      // We just keep them as is for now
      otherSelections.push(sel)
    }
  }

  // 2) For each group of Fields with the same alias, unify their sub‐selection
  const mergedFieldNodes: FieldNode[] = []
  for (const fieldNodes of fieldMap.values()) {
    if (fieldNodes.length === 1) {
      // nothing to merge
      mergedFieldNodes.push(fieldNodes[0]!)
      continue
    }

    // Multiple field nodes => combine them:
    // (a) They should have the same name + alias, or they'd be a conflict
    // (b) Merge their selection sets
    let mergedSelection: SelectionSetNode | undefined
    for (const f of fieldNodes) {
      if (!mergedSelection) {
        mergedSelection = f.selectionSet
      } else if (f.selectionSet) {
        mergedSelection = {
          kind: Kind.SELECTION_SET,
          selections: [
            ...mergedSelection.selections,
            ...f.selectionSet.selections,
          ],
        }
      }
    }

    // Make a single field node with the union of sub‐selections
    const first = fieldNodes[0]!
    const newField: FieldNode = {
      ...first,
      // if they differ in name, strictly that's a conflict, but in practice
      // you could handle if they truly have the same alias but different field.name
      selectionSet: mergedSelection,
    }
    mergedFieldNodes.push(newField)
  }

  // 3) Return a new selection set with the merged fields + original “other” stuff
  return {
    ...selectionSet,
    selections: [...mergedFieldNodes, ...otherSelections],
  }
}

/**
 * Whether the value is a variable or contains one, in a list or an input
 * object.
 */
function containsVariable(value: ValueNode): boolean {
  switch (value.kind) {
    case Kind.VARIABLE:
      return true
    case Kind.LIST:
      return !!value.values?.some(containsVariable)
    case Kind.OBJECT:
      return !!value.fields?.some((field) => containsVariable(field.value))
    default:
      return false
  }
}

function hasVariableArgument(node: {
  readonly arguments?: readonly ArgumentNode[]
}): boolean {
  return !!node.arguments?.some((argument) => containsVariable(argument.value))
}

function hasVariableInDirectives(node: NodeWithDirectives): boolean {
  return !!node.directives?.some(hasVariableArgument)
}

/**
 * Get the names of the fragments that an operation or fragment spreads, and
 * whether it uses a variable, in an argument or a directive. The variable
 * definitions of an operation are not usages.
 *
 * It only follows the selections, so it's much faster than visit().
 *
 * @param node - The operation or fragment definition.
 *
 * @returns The names of the spread fragments and whether a variable is used.
 */
export function scanSelections(
  node: OperationDefinitionNode | FragmentDefinitionNode,
): { fragments: string[]; usesVariables: boolean } {
  const fragments = new Set<string>()
  let usesVariables = hasVariableInDirectives(node)

  const scan = (selectionSet: SelectionSetNode): void => {
    for (const selection of selectionSet.selections) {
      usesVariables ||= hasVariableInDirectives(selection)
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        fragments.add(selection.name.value)
        continue
      }
      if (selection.kind === Kind.FIELD) {
        usesVariables ||= hasVariableArgument(selection)
      }
      if (selection.selectionSet) {
        scan(selection.selectionSet)
      }
    }
  }
  scan(node.selectionSet)

  return { fragments: [...fragments], usesVariables }
}

export function getAstSource(
  node: OperationDefinitionNode | FragmentDefinitionNode,
): string | null {
  const loc = node.loc
  if (!loc) {
    return null
  }
  return loc.source.body.slice(loc.start, loc.end)
}
