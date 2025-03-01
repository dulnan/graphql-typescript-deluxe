export type IRNodeScalar = {
  kind: 'SCALAR'
  description?: string | null
  nullable: boolean
  tsType: string
}

export type IRNodeTypename = {
  kind: 'TYPENAME'
  description?: string | null
  nullable: boolean

  /**
   * The possible object types.
   */
  types: string[]

  /**
   * The name of an abstract type that should act as the type from which types are excluded.
   *
   * When provided, the generated output will be:
   * Exclude<EXCLUDE_TYPE, TYPES>
   */
  excludeType?: string
}

export type IRNodeObject = {
  kind: 'OBJECT'
  description?: string | null
  nullable: boolean
  /**
   * The GraphQL type name (like "User")
   */
  graphQLTypeName: string
  fields: Record<string, IRNode>
}

export type IRNodeArray = {
  kind: 'ARRAY'
  description?: string | null
  nullable: boolean
  nullableElement: boolean
  ofType: IRNode
}

export type IRNodeUnion = {
  kind: 'UNION'
  description?: string | null
  nullable: boolean
  types: IRNode[]
}

export type IRNodeFragmentSpread = {
  kind: 'FRAGMENT_SPREAD'
  description?: string | null
  nullable: boolean

  /**
   * The name of the fragment definition node.
   */
  name: string

  /**
   * The name of the generated TypeScript type representing this fragment.
   */
  fragmentTypeName: string

  /**
   * The schema type condition of the fragment. Could be an abstract or object type.
   */
  fragmentTypeCondition: string

  /**
   * The type of the field in which the fragment is spread.
   */
  parentType: string
}

/**
 * An IR node for the final shape:
 */
export type IRNode =
  | IRNodeScalar
  | IRNodeObject
  | IRNodeArray
  | IRNodeUnion
  | IRNodeFragmentSpread
  | IRNodeTypename

type KindToNode = {
  SCALAR: IRNodeScalar
  OBJECT: IRNodeObject
  ARRAY: IRNodeArray
  UNION: IRNodeUnion
  FRAGMENT_SPREAD: IRNodeFragmentSpread
  TYPENAME: IRNodeTypename
}

function nodeFactory<K extends IRNode['kind']>(
  kind: K,
): (props: Omit<KindToNode[K], 'kind'>) => KindToNode[K] {
  return (props) => {
    return { kind, ...props } as KindToNode[K]
  }
}

// Posible Intermediate representations.
export const IR = {
  SCALAR: nodeFactory('SCALAR'),
  OBJECT: nodeFactory('OBJECT'),
  ARRAY: nodeFactory('ARRAY'),
  UNION: nodeFactory('UNION'),
  FRAGMENT_SPREAD: nodeFactory('FRAGMENT_SPREAD'),
  TYPENAME: (
    types: string[] | string,
    excludeType?: string,
  ): IRNodeTypename => {
    return {
      kind: 'TYPENAME',
      types: Array.isArray(types) ? types : [types],
      nullable: false,
      excludeType,
    }
  },
}

export function mergeFragmentSpread(
  fields: Record<string, IRNode>,
  spread: IRNodeFragmentSpread,
): Record<string, IRNode> {
  const key = `__fragment_${spread.fragmentTypeName}`
  fields[key] = mergeIR(fields[key], spread)
  return fields
}

export function unifyUnionBranches(
  aBranches: IRNode[],
  bBranches: IRNode[],
): IRNode[] {
  // Build a map of object branches for quick lookup by name
  // Also collect all “non-object” branches (FRAGMENT_SPREAD, SCALAR, etc.)
  const aMap = new Map<string, IRNode>()
  const aOthers: IRNode[] = []

  for (const branch of aBranches) {
    if (branch.kind === 'OBJECT') {
      aMap.set(branch.graphQLTypeName, branch)
    } else {
      aOthers.push(branch)
    }
  }

  const out: IRNode[] = []
  // Merge each b-branch
  for (const branch of bBranches) {
    if (branch.kind === 'OBJECT') {
      const existing = aMap.get(branch.graphQLTypeName)
      if (existing) {
        // Both unions have an OBJECT for the same type => unify them
        const merged = mergeIR(existing, branch)
        out.push(merged)
        aMap.delete(branch.graphQLTypeName) // we used it up
      } else {
        // no match => just add it
        out.push(branch)
      }
    } else {
      // e.g. SCALAR, FRAGMENT_SPREAD, etc.
      out.push(branch)
    }
  }

  // Add in any leftover branches that were in aMap but no match in b
  for (const leftover of aMap.values()) {
    out.push(leftover)
  }
  // Also add the leftover aOthers
  out.push(...aOthers)

  return out
}

/**
 * Merge a new IR node into an existing field IR. If there's a mismatch,
 * we produce a union. Otherwise we unify them.
 */
export function mergeIR(oldIR: IRNode | undefined, newIR: IRNode): IRNode {
  if (!oldIR) return newIR
  if (oldIR.kind !== newIR.kind) {
    return IR.UNION({
      types: flattenUnion([oldIR, newIR]),
      nullable: !!(oldIR.nullable || newIR.nullable),
    })
  }

  // Then in the `UNION` vs. `UNION` case:
  if (oldIR.kind === 'UNION' && newIR.kind === 'UNION') {
    // Instead of naive concatenation, unify:
    const unifiedTypes = unifyUnionBranches(oldIR.types, newIR.types)
    return IR.UNION({
      types: unifiedTypes,
      nullable: oldIR.nullable || newIR.nullable,
    })
  }

  // same kind => unify
  switch (oldIR.kind) {
    case 'SCALAR': {
      const bothScalar = newIR.kind === 'SCALAR'
      if (!bothScalar) {
        return IR.UNION({
          types: flattenUnion([oldIR, newIR]),
          nullable: oldIR.nullable || newIR.nullable,
        })
      }
      if (oldIR.tsType === newIR.tsType) {
        return IR.SCALAR({
          tsType: oldIR.tsType,
          nullable: oldIR.nullable && newIR.nullable,
        })
      }
      // Different scalar types => union of them
      return IR.SCALAR({
        tsType: `${oldIR.tsType} | ${newIR.tsType}`,
        nullable: oldIR.nullable || newIR.nullable,
      })
    }
    case 'TYPENAME': {
      if (newIR.kind !== 'TYPENAME') {
        return IR.UNION({
          types: [oldIR, newIR],
          nullable: oldIR.nullable || newIR.nullable,
        })
      }

      // Merge types arrays, ensuring uniqueness
      const mergedTypes = [...new Set([...oldIR.types, ...newIR.types])]

      // Use the TS.TYPENAME factory, then override nullable
      const result = IR.TYPENAME(mergedTypes)
      result.nullable = oldIR.nullable || newIR.nullable
      return result
    }
    case 'OBJECT': {
      if (newIR.kind !== 'OBJECT') {
        return IR.UNION({
          types: [oldIR, newIR],
          nullable: oldIR.nullable || newIR.nullable,
        })
      }
      // Merge fields
      const mergedFields = mergeObjectIR({ ...oldIR.fields }, newIR.fields)
      return IR.OBJECT({
        graphQLTypeName:
          oldIR.graphQLTypeName === newIR.graphQLTypeName
            ? oldIR.graphQLTypeName
            : oldIR.graphQLTypeName,
        fields: mergedFields,
        nullable: oldIR.nullable || newIR.nullable,
      })
    }
    case 'ARRAY': {
      if (newIR.kind !== 'ARRAY') {
        return IR.UNION({
          types: [oldIR, newIR],
          nullable: oldIR.nullable || newIR.nullable,
        })
      }
      // unify elements
      const mergedElem = mergeIR(oldIR.ofType, newIR.ofType)
      return IR.ARRAY({
        ofType: mergedElem,
        nullable: oldIR.nullable || newIR.nullable,
        nullableElement: oldIR.nullableElement || newIR.nullableElement,
      })
    }
    case 'UNION': {
      if (newIR.kind !== 'UNION') {
        return IR.UNION({
          types: [...oldIR.types, newIR],
          nullable: oldIR.nullable || newIR.nullable,
        })
      }
      return IR.UNION({
        types: [...oldIR.types, ...newIR.types],
        nullable: oldIR.nullable || newIR.nullable,
      })
    }
    case 'FRAGMENT_SPREAD': {
      if (newIR.kind !== 'FRAGMENT_SPREAD') {
        return IR.UNION({
          types: [oldIR, newIR],
          nullable: true,
        })
      }
      // If same fragment => keep one
      if (oldIR.fragmentTypeName === newIR.fragmentTypeName) {
        return oldIR
      }
      // else union
      return IR.UNION({
        types: [oldIR, newIR],
        nullable: true,
      })
    }
  }
}

/**
 * Merge all fields from source into target (object IR).
 */
export function mergeObjectIR(
  target: Record<string, IRNode>,
  source: Record<string, IRNode>,
): Record<string, IRNode> {
  for (const [key, val] of Object.entries(source)) {
    target[key] = mergeIR(target[key], val)
  }
  return target
}

/**
 * Flatten any union nodes in the array into a single-level array
 */
export function flattenUnion(nodes: IRNode[]): IRNode[] {
  const out: IRNode[] = []
  for (const n of nodes) {
    if (n.kind === 'UNION') {
      out.push(...n.types)
    } else {
      out.push(n)
    }
  }
  return out
}

/**
 * Very naive check if two IR nodes are structurally identical.
 */
export function isIdenticalIR(a: IRNode, b: IRNode): boolean {
  if (a.kind !== b.kind) return false
  switch (a.kind) {
    case 'SCALAR': {
      return (
        b.kind === 'SCALAR' &&
        a.tsType === b.tsType &&
        a.nullable === b.nullable
      )
    }
    case 'TYPENAME': {
      return (
        b.kind === 'TYPENAME' &&
        a.types.join('-') === b.types.join('-') &&
        a.excludeType === b.excludeType &&
        a.nullable === b.nullable
      )
    }
    case 'OBJECT': {
      if (b.kind !== 'OBJECT') return false
      if (a.graphQLTypeName !== b.graphQLTypeName) return false
      if (a.nullable !== b.nullable) return false
      const aKeys = Object.keys(a.fields).sort()
      const bKeys = Object.keys(b.fields).sort()
      if (aKeys.length !== bKeys.length) return false
      for (let i = 0; i < aKeys.length; i++) {
        const k = aKeys[i]
        if (k !== bKeys[i]) return false
        if (!isIdenticalIR(a.fields[k], b.fields[k])) return false
      }
      return true
    }
    case 'ARRAY': {
      if (b.kind !== 'ARRAY') return false
      if (a.nullable !== b.nullable) return false
      if (a.nullableElement !== b.nullableElement) return false
      return isIdenticalIR(a.ofType, b.ofType)
    }
    case 'UNION': {
      if (b.kind !== 'UNION') return false
      if (a.nullable !== b.nullable) return false
      if (a.types.length !== b.types.length) return false
      for (let i = 0; i < a.types.length; i++) {
        if (!isIdenticalIR(a.types[i], b.types[i])) return false
      }
      return true
    }
    case 'FRAGMENT_SPREAD': {
      if (b.kind !== 'FRAGMENT_SPREAD') return false
      return a.fragmentTypeName === b.fragmentTypeName
    }
  }
}

export function unifyObjectsDifferingOnlyInTypename(
  objects: IRNodeObject[],
): IRNodeObject {
  // We assume these all have the same shape except for possibly
  // different literal values of `__typename`. So we:
  // 1) Take the first object’s fields as a base
  // 2) For `__typename`, gather all the distinct literal values from each object
  // 3) Everything else is the same (if your signature logic is correct)
  // 4) Mark `nonNull: true` if any object is nonNull (OR them together)

  if (objects.length === 1) return objects[0]

  const base = { ...objects[0] }
  const mergedFields = { ...base.fields }

  let anyNullable = base.nullable
  const typenames = new Set<string>()
  let hasTypenameField = false

  // Collect all literal values from each object’s __typename
  for (const obj of objects) {
    anyNullable = !anyNullable || !obj.nullable
    const tnField = obj.fields['__typename']
    if (tnField && tnField.kind === 'TYPENAME' && !tnField.excludeType) {
      hasTypenameField = true
      tnField.types.forEach((name) => typenames.add(name))
    }
  }

  // If we have a __typename field, unify them
  if (hasTypenameField) {
    mergedFields['__typename'] = IR.TYPENAME([...typenames.values()])
  }

  return IR.OBJECT({
    ...base,
    fields: mergedFields,
    nullable: anyNullable,
  })
}

/**
 * Create
 */
export function buildNodeKeyWithoutTypename(ir: IRNode): string {
  let key = ir.kind
  switch (ir.kind) {
    case 'SCALAR': {
      key += ir.tsType
      break
    }
    case 'OBJECT': {
      // We'll do a shallow marker. If you want to unify nested objects,
      // you can recursively call buildObjectSignatureIgnoringTypename again,
      // but that can get complicated. For 100% correctness, you'd do so:
      for (const [k, child] of Object.entries(ir.fields)) {
        key += k
        // watch out for infinite recursion in large shapes,
        // but typically it's safe to do the same approach:
        if (k === '__typename' && child.kind === 'TYPENAME') {
          key += '__TYPENAME_PLACEHOLDER__'
        } else {
          key += buildNodeKeyWithoutTypename(child)
        }
      }
      break
    }
    case 'ARRAY': {
      key += buildNodeKeyWithoutTypename(ir.ofType)
      break
    }
    case 'UNION': {
      key += ir.types.map((v) => v.kind).join('-')
      break
    }
    case 'FRAGMENT_SPREAD': {
      key += ir.fragmentTypeName
      break
    }
  }

  return key
}

export function mergeUnionBranchesThatDifferOnlyInTypename(
  branches: IRNode[],
): IRNode[] {
  // Non-OBJECT nodes remain as-is for now. We only unify OBJECT<->OBJECT.
  // We'll separate them out:
  const objectBranches: IRNodeObject[] = []
  const otherBranches: IRNode[] = []

  for (const b of branches) {
    if (b.kind === 'OBJECT') {
      objectBranches.push(b)
    } else {
      otherBranches.push(b)
    }
  }

  // Group OBJECT branches by “shapeSignature” ignoring the literal __typename.
  // shapeSignature is basically a stable string that describes all fields except
  // for the literal part of __typename. For example, if __typename is `'Foo' | 'Bar'`,
  // we temporarily treat that as a placeholder or ignore it in the signature.
  const groups = new Map<string, IRNodeObject[]>()

  for (const obj of objectBranches) {
    const sig = buildNodeKeyWithoutTypename(obj)
    const arr = groups.get(sig) || []
    arr.push(obj)
    groups.set(sig, arr)
  }

  // For each group with multiple branches, unify them by combining their
  // __typename fields into a union of strings.
  const mergedObjects: IRNodeObject[] = []
  for (const objs of groups.values()) {
    if (objs.length === 1) {
      mergedObjects.push(objs[0])
      continue
    }

    // Merge them all
    const merged = unifyObjectsDifferingOnlyInTypename(objs)
    mergedObjects.push(merged)
  }

  // The final union is the merged objects plus the non-object branches
  // (some other pass might deduplicate further, but this focuses on the __typename problem).
  return [...mergedObjects, ...otherBranches]
}

/**
 * Recursively merges union branches that differ ONLY by their __typename literal.
 * Returns a new IR node (or the same node if nothing changed).
 */
export function postProcessIR(ir: IRNode): IRNode {
  switch (ir.kind) {
    case 'SCALAR':
    case 'FRAGMENT_SPREAD':
    case 'TYPENAME':
      return ir

    case 'OBJECT': {
      // Recurse into each field
      const newFields: Record<string, IRNode> = {}
      for (const [fieldName, fieldIR] of Object.entries(ir.fields)) {
        newFields[fieldName] = postProcessIR(fieldIR)
      }
      return {
        ...ir,
        fields: newFields,
      }
    }

    case 'ARRAY': {
      // Recurse into the element type
      return {
        ...ir,
        ofType: postProcessIR(ir.ofType),
      }
    }

    case 'UNION': {
      // First recurse into each branch
      const processedBranches = ir.types.map((t) => postProcessIR(t))
      // Then unify any that only differ by __typename
      const merged =
        mergeUnionBranchesThatDifferOnlyInTypename(processedBranches)
      return {
        ...ir,
        types: merged,
      }
    }
  }
}

export function markNonNull<T extends IRNode>(ir: T): T {
  const clone: T = {
    ...ir,
    nullable: false,
  }
  return clone
}

/**
 * If we have a field named __typename in the given fields, return true
 */
export function hasTypenameField(fields: Record<string, IRNode>): boolean {
  return Object.keys(fields).some((k) => k === '__typename')
}
