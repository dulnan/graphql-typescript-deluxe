import {
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type InlineFragmentNode,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type TypeNode,
} from 'graphql'

export function unwrapNonNull(typeNode: TypeNode): {
  type: TypeNode
  isNonNull: boolean
} {
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return { type: typeNode.type, isNonNull: true }
  }
  return { type: typeNode, isNonNull: false }
}

/**
 * Determines if the field node has any of the two default conditional directives.
 */
export function hasConditionalDirective(node: FieldNode): boolean {
  if (!node.directives) {
    return false
  }

  for (let i = 0; i < node.directives.length; i++) {
    const name = node.directives[i]!.name.value
    if (name === 'skip' || name === 'include') {
      return true
    }
  }

  return false
}

export function mergeSameFieldSelections(
  selectionSet: SelectionSetNode,
): SelectionSetNode {
  // 1) Group FIELD nodes by alias (or name if no alias).
  const fieldMap = new Map<string, FieldNode[]>()
  const otherSelections: (FragmentSpreadNode | InlineFragmentNode)[] = []

  for (const sel of selectionSet.selections) {
    if (sel.kind === Kind.FIELD) {
      const aliasOrName = sel.alias?.value || sel.name.value
      const existing = fieldMap.get(aliasOrName) ?? []
      existing.push(sel)
      fieldMap.set(aliasOrName, existing)
    } else {
      // Inline fragments, fragment spreads, etc. do not merge by alias
      // We just keep them as is for now
      otherSelections.push(sel)
    }
  }

  // 2) For each group of Fields with the same alias, unify their sub‐selection
  const mergedFieldNodes: FieldNode[] = []
  for (const fieldNodes of fieldMap.values()) {
    if (!fieldNodes.length) {
      continue
    } else if (fieldNodes.length === 1) {
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
 * Inline fragments on operations.
 */
export function getTypeNodeKey(node: TypeNode): string {
  let key = ''
  if (node.kind === Kind.NAMED_TYPE) {
    key += node.name.value
  } else if (node.kind === Kind.LIST_TYPE) {
    key += 'list-' + getTypeNodeKey(node.type)
  } else {
    key += 'non-null-' + getTypeNodeKey(node.type)
  }
  return key
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
