import {
  type DirectiveNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type InlineFragmentNode,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
  print,
} from 'graphql'

function isConditionalDirective(directive: DirectiveNode): boolean {
  const name = directive.name.value
  return name === 'skip' || name === 'include'
}

/**
 * Determines if the field node has any of the two default conditional directives.
 */
export function hasConditionalDirective(node: FieldNode): boolean {
  return !!node.directives?.some(isConditionalDirective)
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
      const condition = (sel.directives ?? [])
        .filter(isConditionalDirective)
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

export function getAstSource(
  node: OperationDefinitionNode | FragmentDefinitionNode,
): string | null {
  const loc = node.loc
  if (!loc) {
    return null
  }
  return loc.source.body.slice(loc.start, loc.end)
}
