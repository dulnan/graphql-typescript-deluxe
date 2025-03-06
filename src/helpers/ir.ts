import { TYPENAME } from '../constants'
import { LogicError } from '../errors'

export type IRNodeScalar = {
  kind: 'SCALAR'
  description?: string | null
  nullable?: boolean
  tsType: string
}

export type IRNodeTypename = {
  kind: 'TYPENAME'
  description?: string | null
  nullable?: boolean

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
  nullable?: boolean
  /**
   * The GraphQL type name (like "User")
   */
  graphQLTypeName: string
  fields: Record<string, IRNode>
}

export type IRNodeArray = {
  kind: 'ARRAY'
  description?: string | null
  nullable?: boolean
  nullableElement: boolean
  ofType: IRNode
}

export type IRNodeUnion = {
  kind: 'UNION'
  description?: string | null
  nullable?: boolean
  types: IRNode[]
}

export type IRNodeIntersection = {
  kind: 'INTERSECTION'
  description?: string | null
  nullable?: boolean
  types: IRNode[]
}

export type IRNodeFragmentSpread = {
  kind: 'FRAGMENT_SPREAD'
  description?: string | null
  nullable?: boolean

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
  | IRNodeIntersection
  | IRNodeFragmentSpread
  | IRNodeTypename

type KindToNode = {
  SCALAR: IRNodeScalar
  OBJECT: IRNodeObject
  ARRAY: IRNodeArray
  UNION: IRNodeUnion
  INTERSECTION: IRNodeIntersection
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
  INTERSECTION: nodeFactory('INTERSECTION'),
  FRAGMENT_SPREAD: nodeFactory('FRAGMENT_SPREAD'),
  TYPENAME: (
    types: string[] | string,
    excludeType?: string,
  ): IRNodeTypename => {
    return {
      kind: 'TYPENAME',
      types: Array.isArray(types) ? types : [types],
      excludeType,
    }
  },
}

export function mergeFragmentSpread(
  fields: Record<string, IRNode>,
  spread: IRNodeFragmentSpread,
): Record<string, IRNode> {
  const key = `__fragment_${spread.fragmentTypeName}`
  const existing = fields[key]
  fields[key] = existing ? mergeIR(existing, spread) : spread
  return fields
}

export function unifyUnionBranches(
  aBranches: IRNode[],
  bBranches: IRNode[],
): IRNode[] {
  // A map of object branches.
  const aMap = new Map<string, IRNodeObject>()
  // Also collect all “non-object” branches (FRAGMENT_SPREAD, SCALAR, etc.)
  const out: IRNode[] = []

  for (const branch of aBranches) {
    if (branch.kind === 'OBJECT') {
      // @TODO: We probably can't end up in here with multiple branches for the
      // same object type, but maybe it should still be handled.
      // Currently we just override it which could be a source of bugs.
      aMap.set(branch.graphQLTypeName, branch)
    } else {
      out.push(branch)
    }
  }

  for (const branch of bBranches) {
    if (branch.kind === 'OBJECT') {
      const existing = aMap.get(branch.graphQLTypeName)
      if (existing) {
        // Both unions have an OBJECT for the same type => unify them.
        const merged = mergeIR(existing, branch)
        out.push(merged)
        aMap.delete(branch.graphQLTypeName)
      } else {
        out.push(branch)
      }
    } else {
      out.push(branch)
    }
  }

  // Add in any leftover branches that were in aMap but no match in b
  out.push(...aMap.values())
  return out
}

function mergeScalar(oldIR: IRNodeScalar, newIR: IRNodeScalar): IRNodeScalar {
  if (oldIR.tsType === newIR.tsType) {
    return IR.SCALAR({
      tsType: oldIR.tsType,
      nullable: oldIR.nullable && newIR.nullable,
      description: newIR.description || newIR.description,
    })
  }

  // Different scalar types: Create a literal union.
  return IR.SCALAR({
    tsType: `${oldIR.tsType} | ${newIR.tsType}`,
    nullable: oldIR.nullable || newIR.nullable,
    description: newIR.description || oldIR.description,
  })
}

function mergeTypenameNodes(
  oldIR: IRNodeTypename,
  newIR: IRNodeTypename,
): IRNodeTypename {
  // Merge types while removing duplicates.
  const mergedTypes = [...new Set([...oldIR.types, ...newIR.types])]

  const result = IR.TYPENAME(mergedTypes)
  result.nullable = oldIR.nullable || newIR.nullable
  return result
}

function mergeObjectNodes(
  oldIR: IRNodeObject,
  newIR: IRNodeObject,
): IRNodeObject {
  // Merge fields
  const mergedFields = mergeObjectFields({ ...oldIR.fields }, newIR.fields)
  return IR.OBJECT({
    graphQLTypeName: oldIR.graphQLTypeName,
    fields: mergedFields,
    nullable: oldIR.nullable || newIR.nullable,
    description: newIR.description || oldIR.description,
  })
}

function mergeArrayNodes(oldIR: IRNodeArray, newIR: IRNodeArray): IRNodeArray {
  const mergedElem = mergeIR(oldIR.ofType, newIR.ofType)
  return IR.ARRAY({
    ofType: mergedElem,
    nullable: oldIR.nullable || newIR.nullable,
    nullableElement: oldIR.nullableElement || newIR.nullableElement,
    description: newIR.description || oldIR.description,
  })
}

function mergeUnionNodes(oldIR: IRNodeUnion, newIR: IRNodeUnion): IRNodeUnion {
  const unifiedTypes = unifyUnionBranches(oldIR.types, newIR.types)
  return IR.UNION({
    types: unifiedTypes,
    nullable: oldIR.nullable || newIR.nullable,
    description: newIR.description || oldIR.description,
  })
}

function mergeFragmentSpreadNodes(
  oldIR: IRNodeFragmentSpread,
  newIR: IRNodeFragmentSpread,
): IRNodeFragmentSpread | IRNodeUnion {
  // If same fragment => keep one
  if (oldIR.fragmentTypeName === newIR.fragmentTypeName) {
    return oldIR
  }
  // else union
  return IR.UNION({
    types: [oldIR, newIR],
    description: newIR.description || oldIR.description,
  })
}

/**
 * Merge a new IR node into an existing IR. If there's a mismatch,
 * we produce a union. Otherwise we unify them.
 *
 * @param oldIR - The old IR.
 * @param newIR - The new IR.
 *
 * @returns The merged IR.
 */
export function mergeIR(oldIR: IRNode, newIR: IRNode): IRNode {
  if (oldIR.kind === 'SCALAR' && newIR.kind === 'SCALAR') {
    return mergeScalar(oldIR, newIR)
  } else if (oldIR.kind === 'TYPENAME' && newIR.kind === 'TYPENAME') {
    return mergeTypenameNodes(oldIR, newIR)
  } else if (oldIR.kind === 'OBJECT' && newIR.kind === 'OBJECT') {
    return mergeObjectNodes(oldIR, newIR)
  } else if (oldIR.kind === 'ARRAY' && newIR.kind === 'ARRAY') {
    return mergeArrayNodes(oldIR, newIR)
  } else if (oldIR.kind === 'UNION' && newIR.kind === 'UNION') {
    return mergeUnionNodes(oldIR, newIR)
  } else if (
    oldIR.kind === 'FRAGMENT_SPREAD' &&
    newIR.kind === 'FRAGMENT_SPREAD'
  ) {
    return mergeFragmentSpreadNodes(oldIR, newIR)
  }

  // Fallback: Create a union.
  return IR.UNION({
    types: flattenUnion([oldIR, newIR]),
    nullable: !!(oldIR.nullable || newIR.nullable),
    description: newIR.description || oldIR.description,
  })
}

/**
 * Merge all fields from source into target (object IR).
 */
export function mergeObjectFields(
  target: Record<string, IRNode>,
  source: Record<string, IRNode>,
): Record<string, IRNode> {
  for (const [key, val] of Object.entries(source)) {
    const targetIR = target[key]
    target[key] = targetIR ? mergeIR(targetIR, val) : val
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

function areScalarsIdentical(a: IRNodeScalar, b: IRNodeScalar): boolean {
  return a.tsType === b.tsType && a.nullable === b.nullable
}

function areTypenamesIdentical(a: IRNodeTypename, b: IRNodeTypename): boolean {
  return (
    a.types.join('-') === b.types.join('-') &&
    a.excludeType === b.excludeType &&
    a.nullable === b.nullable
  )
}

function areObjectsIdentical(a: IRNodeObject, b: IRNodeObject): boolean {
  if (a.graphQLTypeName !== b.graphQLTypeName) {
    return false
  }

  if (a.nullable !== b.nullable) {
    return false
  }

  const aKeys = Object.keys(a.fields).sort()
  const bKeys = Object.keys(b.fields).sort()
  if (aKeys.length !== bKeys.length) return false

  for (let i = 0; i < aKeys.length; i++) {
    const k = aKeys[i]
    if (!k || k !== bKeys[i]) return false
    if (!isIdenticalIR(a.fields[k]!, b.fields[k]!)) return false
  }

  return true
}

function areArraysIdentical(a: IRNodeArray, b: IRNodeArray): boolean {
  if (a.nullable !== b.nullable) return false
  if (a.nullableElement !== b.nullableElement) return false
  return isIdenticalIR(a.ofType, b.ofType)
}

function areUnionsIdentical(a: IRNodeUnion, b: IRNodeUnion): boolean {
  if (a.nullable !== b.nullable) return false
  if (a.types.length !== b.types.length) return false
  for (let i = 0; i < a.types.length; i++) {
    if (!isIdenticalIR(a.types[i]!, b.types[i]!)) return false
  }
  return true
}

function areFragmentSpreadsIdentical(
  a: IRNodeFragmentSpread,
  b: IRNodeFragmentSpread,
): boolean {
  return a.fragmentTypeName === b.fragmentTypeName
}

/**
 * Check if two nodes are identical.
 *
 * @param a - First node.
 * @param b - Second node.
 *
 * @returns True if both nodes are identical.
 */
export function isIdenticalIR(a: IRNode, b: IRNode): boolean {
  if (a.nullable !== b.nullable) {
    return false
  }

  if (a.kind === 'SCALAR' && b.kind === 'SCALAR') {
    return areScalarsIdentical(a, b)
  } else if (a.kind === 'TYPENAME' && b.kind === 'TYPENAME') {
    return areTypenamesIdentical(a, b)
  } else if (a.kind === 'OBJECT' && b.kind === 'OBJECT') {
    return areObjectsIdentical(a, b)
  } else if (a.kind === 'ARRAY' && b.kind === 'ARRAY') {
    return areArraysIdentical(a, b)
  } else if (a.kind === 'UNION' && b.kind === 'UNION') {
    return areUnionsIdentical(a, b)
  } else if (a.kind === 'FRAGMENT_SPREAD' && b.kind === 'FRAGMENT_SPREAD') {
    return areFragmentSpreadsIdentical(a, b)
  }

  return false
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

  if (objects.length === 1) {
    return objects[0]!
  } else if (objects.length === 0) {
    throw new LogicError(
      'Need at least one object in unifyObjectsDifferingOnlyInTypename.',
    )
  }

  const base = { ...objects[0]! }
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
    nullable: !!anyNullable,
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
  // we treat that as a placeholder.
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
      mergedObjects.push(objs[0]!)
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
 * Flattens the IR structure, removing duplicate branches.
 * Returns a new IR node (or the same node if nothing changed).
 *
 * @param ir - The node to process.
 *
 * @returns The processed, new node or the passed in node if unprocessed.
 */
export function postProcessIR(ir: IRNode): IRNode {
  switch (ir.kind) {
    case 'SCALAR':
    case 'FRAGMENT_SPREAD':
    case 'TYPENAME':
      return ir

    case 'OBJECT': {
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
      return {
        ...ir,
        ofType: postProcessIR(ir.ofType),
      }
    }

    case 'UNION': {
      // First recurse into each branch
      const processedBranches = ir.types.map((t) => postProcessIR(t))
      return {
        ...ir,
        types: mergeUnionBranchesThatDifferOnlyInTypename(processedBranches),
      }
    }

    case 'INTERSECTION': {
      // First recurse into each branch
      const processedBranches = ir.types.map((t) => postProcessIR(t))
      return {
        ...ir,
        types: processedBranches,
      }
    }
  }

  // @ts-expect-error Should never end up here.
  throw new LogicError('Unknown IR type: ' + ir.kind)
}

/**
 * If we have a field named __typename in the given fields, return true
 */
export function hasTypenameField(fields: Record<string, IRNode>): boolean {
  return fields[TYPENAME] !== undefined
}

export function buildFragmentIRFields(ir: IRNode): Record<string, IRNode> {
  // If it's an OBJECT node, just return its fields.
  if (ir.kind === 'OBJECT') {
    return ir.fields
  }

  // If it's a UNION, unify all OBJECT branches.
  if (ir.kind === 'UNION') {
    let merged: Record<string, IRNode> = {}
    for (const branch of ir.types) {
      if (branch.kind === 'OBJECT') {
        merged = mergeObjectFields(merged, branch.fields)
      }
    }
    return merged
  }

  // There are no fields.
  return {}
}
