import { TYPENAME } from '../constants'

export type IRNodeScalar = {
  kind: 'SCALAR'
  description?: string | null
  optional?: boolean
  nullable?: boolean
  tsType: string
}

export type IRNodeTypename = {
  kind: 'TYPENAME'
  description?: string | null
  optional?: boolean
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
  optional?: boolean
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
  optional?: boolean
  nullable?: boolean
  nullableElement: boolean
  ofType: IRNode
}

export type IRNodeUnion = {
  kind: 'UNION'
  description?: string | null
  optional?: boolean
  nullable?: boolean
  types: IRNode[]
}

export type IRNodeFragmentSpread = {
  kind: 'FRAGMENT_SPREAD'
  description?: string | null
  optional?: boolean
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

/**
 * Returns a copy of the node, marked as optional.
 */
function asOptional<T extends IRNode>(node: T): T {
  return { ...node, optional: true }
}

/**
 * Returns a copy of the object node with all its fields marked as optional.
 */
function withOptionalFields(node: IRNodeObject): IRNodeObject {
  const fields: Record<string, IRNode> = {}
  for (const [key, field] of Object.entries(node.fields)) {
    fields[key] = asOptional(field)
  }
  return { ...node, fields }
}

function unifyUnionBranches(
  aBranches: IRNode[],
  bBranches: IRNode[],
  aMayBeMissing: boolean,
  bMayBeMissing: boolean,
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
        const merged = mergeIR(existing, branch, aMayBeMissing, bMayBeMissing)
        out.push(merged)
        aMap.delete(branch.graphQLTypeName)
      } else {
        out.push(bMayBeMissing ? withOptionalFields(branch) : branch)
      }
    } else {
      out.push(branch)
    }
  }

  // Add in any leftover branches that were in aMap but no match in b
  for (const branch of aMap.values()) {
    out.push(aMayBeMissing ? withOptionalFields(branch) : branch)
  }
  return out
}

function mergeScalar(oldIR: IRNodeScalar, newIR: IRNodeScalar): IRNodeScalar {
  if (oldIR.tsType === newIR.tsType) {
    return IR.SCALAR({
      tsType: oldIR.tsType,
      nullable: oldIR.nullable && newIR.nullable,
      description: newIR.description || oldIR.description,
    })
  }

  // Different scalar types: Create a literal union.
  return IR.SCALAR({
    tsType: `${oldIR.tsType} | ${newIR.tsType}`,
    nullable: oldIR.nullable || newIR.nullable,
    description: newIR.description || oldIR.description,
  })
}

/**
 * Returns the TS code for a typename node.
 *
 * @param node - The typename node.
 *
 * @returns The TS code, either a union of the types or an Exclude<> type.
 */
export function typenameToCode(node: IRNodeTypename): string {
  const union = [...node.types].sort().join(' | ')
  if (node.excludeType) {
    // Special case for Exclude<A, B>: The provided types should be *excluded*
    // from the defined excludeType (which is either a GraphQL interface or union).
    return `Exclude<${node.excludeType}, ${union}>`
  }
  return union
}

function mergeTypenameNodes(
  oldIR: IRNodeTypename,
  newIR: IRNodeTypename,
): IRNodeTypename {
  let result: IRNodeTypename

  const excludeNode = oldIR.excludeType ? oldIR : newIR
  const otherNode = excludeNode === oldIR ? newIR : oldIR

  if (oldIR.excludeType && oldIR.excludeType === newIR.excludeType) {
    // Exclude<A, X> | Exclude<A, Y> is Exclude<A, X & Y>.
    const excluded = oldIR.types.filter((type) => newIR.types.includes(type))
    result = excluded.length
      ? IR.TYPENAME(excluded, oldIR.excludeType)
      : IR.TYPENAME(oldIR.excludeType)
  } else if (
    excludeNode.excludeType &&
    !otherNode.excludeType &&
    otherNode.types.includes(excludeNode.excludeType)
  ) {
    // Exclude<A, X> | A | Y is A | Y.
    result = IR.TYPENAME(otherNode.types)
  } else if (
    excludeNode.excludeType &&
    !otherNode.excludeType &&
    otherNode.types.every((type) => excludeNode.types.includes(type))
  ) {
    // Exclude<A, X> | Y is Exclude<A, X without Y>, if X contains all of Y.
    const excluded = excludeNode.types.filter(
      (type) => !otherNode.types.includes(type),
    )
    result = excluded.length
      ? IR.TYPENAME(excluded, excludeNode.excludeType)
      : IR.TYPENAME(excludeNode.excludeType)
  } else {
    // A union of both, removing duplicates. An Exclude<> type is added as is.
    const toTypes = (node: IRNodeTypename): string[] =>
      node.excludeType ? [typenameToCode(node)] : node.types
    result = IR.TYPENAME([...new Set([...toTypes(oldIR), ...toTypes(newIR)])])
  }

  result.nullable = oldIR.nullable || newIR.nullable
  return result
}

function mergeObjectNodes(
  oldIR: IRNodeObject,
  newIR: IRNodeObject,
  oldMayBeMissing: boolean,
  newMayBeMissing: boolean,
): IRNodeObject {
  // Merge fields
  const mergedFields = mergeObjectFields(
    { ...oldIR.fields },
    newIR.fields,
    oldMayBeMissing,
    newMayBeMissing,
  )
  return IR.OBJECT({
    graphQLTypeName: oldIR.graphQLTypeName,
    fields: mergedFields,
    nullable: oldIR.nullable || newIR.nullable,
    description: newIR.description || oldIR.description,
  })
}

function mergeArrayNodes(
  oldIR: IRNodeArray,
  newIR: IRNodeArray,
  oldMayBeMissing: boolean,
  newMayBeMissing: boolean,
): IRNodeArray {
  const mergedElem = mergeIR(
    oldIR.ofType,
    newIR.ofType,
    oldMayBeMissing,
    newMayBeMissing,
  )
  return IR.ARRAY({
    ofType: mergedElem,
    nullable: oldIR.nullable || newIR.nullable,
    nullableElement: oldIR.nullableElement || newIR.nullableElement,
    description: newIR.description || oldIR.description,
  })
}

function mergeUnionNodes(
  oldIR: IRNodeUnion,
  newIR: IRNodeUnion,
  oldMayBeMissing: boolean,
  newMayBeMissing: boolean,
): IRNodeUnion {
  const unifiedTypes = unifyUnionBranches(
    oldIR.types,
    newIR.types,
    oldMayBeMissing,
    newMayBeMissing,
  )
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
 * Merge two IR nodes of different kinds or of the same kind.
 *
 * The flags tell whether the selection of each node may be missing, which is
 * passed on to the nested fields.
 */
function mergeIRNodes(
  oldIR: IRNode,
  newIR: IRNode,
  oldMayBeMissing: boolean,
  newMayBeMissing: boolean,
): IRNode {
  if (oldIR.kind === 'SCALAR' && newIR.kind === 'SCALAR') {
    return mergeScalar(oldIR, newIR)
  } else if (oldIR.kind === 'TYPENAME' && newIR.kind === 'TYPENAME') {
    return mergeTypenameNodes(oldIR, newIR)
  } else if (oldIR.kind === 'OBJECT' && newIR.kind === 'OBJECT') {
    return mergeObjectNodes(oldIR, newIR, oldMayBeMissing, newMayBeMissing)
  } else if (oldIR.kind === 'ARRAY' && newIR.kind === 'ARRAY') {
    return mergeArrayNodes(oldIR, newIR, oldMayBeMissing, newMayBeMissing)
  } else if (oldIR.kind === 'UNION' && newIR.kind === 'UNION') {
    return mergeUnionNodes(oldIR, newIR, oldMayBeMissing, newMayBeMissing)
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
 * Merge a new IR node into an existing IR. If there's a mismatch,
 * we produce a union. Otherwise we unify them.
 *
 * Both nodes are selections of the same field. A field is included in the
 * response if any of its selections is included, so the merged field is only
 * optional if it may be missing in both selections.
 *
 * A selection may be missing because it is conditional itself (`@include`,
 * `@skip`), or because its parent selection may be missing. The second case is
 * passed in with the `MayBeMissing` arguments. For example, when merging
 * `author { name }` with a conditional `author { email }`, the `email` field
 * is optional: `author` can be there without the conditional selection.
 *
 * @param oldIR - The old IR.
 * @param newIR - The new IR.
 * @param oldMayBeMissing - Whether the parent selection of the old IR may be missing while the merged parent is there.
 * @param newMayBeMissing - The same for the new IR.
 *
 * @returns The merged IR.
 */
export function mergeIR(
  oldIR: IRNode,
  newIR: IRNode,
  oldMayBeMissing = false,
  newMayBeMissing = false,
): IRNode {
  const oldMissing = oldMayBeMissing || !!oldIR.optional
  const newMissing = newMayBeMissing || !!newIR.optional

  // The field is guaranteed if one of the selections is guaranteed. It's also
  // guaranteed if neither selection is conditional itself: Their parent
  // selections may be missing, but the merged parent is only there if one of
  // them is.
  const isGuaranteed =
    !oldMissing || !newMissing || (!oldIR.optional && !newIR.optional)

  const merged = { ...mergeIRNodes(oldIR, newIR, oldMissing, newMissing) }
  if (isGuaranteed) {
    delete merged.optional
  } else {
    merged.optional = true
  }
  return merged
}

/**
 * Merge all fields from source into target (object IR).
 *
 * @param target - The target fields. Modified in place.
 * @param source - The fields to merge into the target.
 * @param targetMayBeMissing - Whether the selection of the target fields may be missing while the parent is there. Fields only the target has are then optional.
 * @param sourceMayBeMissing - The same for the source fields.
 *
 * @returns The target fields.
 */
export function mergeObjectFields(
  target: Record<string, IRNode>,
  source: Record<string, IRNode>,
  targetMayBeMissing = false,
  sourceMayBeMissing = false,
): Record<string, IRNode> {
  if (targetMayBeMissing) {
    for (const [key, val] of Object.entries(target)) {
      if (!source[key]) {
        target[key] = asOptional(val)
      }
    }
  }

  for (const [key, val] of Object.entries(source)) {
    const targetIR = target[key]
    if (targetIR) {
      target[key] = mergeIR(
        targetIR,
        val,
        targetMayBeMissing,
        sourceMayBeMissing,
      )
    } else {
      target[key] = sourceMayBeMissing ? asOptional(val) : val
    }
  }
  return target
}

/**
 * Flatten any union nodes in the array into a single-level array
 */
function flattenUnion(nodes: IRNode[]): IRNode[] {
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

  // Note: nullable is already checked in isIdenticalIR before calling this function

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
  // Note: nullable is already checked in isIdenticalIR before calling this function
  if (a.nullableElement !== b.nullableElement) return false
  return isIdenticalIR(a.ofType, b.ofType)
}

function areUnionsIdentical(a: IRNodeUnion, b: IRNodeUnion): boolean {
  // Note: nullable is already checked in isIdenticalIR before calling this function
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

/**
 * Get the description that all nodes share.
 *
 * @param nodes - The nodes.
 *
 * @returns The description, or null if the nodes have different ones or there are no nodes.
 */
function getSharedDescription(nodes: IRNode[]): string | null {
  const description = nodes[0]?.description || null
  for (const node of nodes) {
    if ((node.description || null) !== description) {
      return null
    }
  }
  return description
}

/**
 * Keep only the descriptions of a merged node that its sources share.
 *
 * The sources can be fields of different types, whose descriptions may not
 * apply to each other. A missing description counts as a different one.
 * Nested fields are compared with the fields of the sources that have them,
 * and union members with the members that generate the same type.
 *
 * @param node - The merged node.
 * @param sources - The nodes from which it was merged.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 *
 * @returns The node with the shared descriptions.
 */
function withSharedDescriptions(
  node: IRNode,
  sources: IRNode[],
  nullableIsOptional: boolean,
): IRNode {
  const description = getSharedDescription(sources)

  if (node.kind === 'OBJECT') {
    const objects = sources.filter((v) => v.kind === 'OBJECT')
    const fields: Record<string, IRNode> = {}
    for (const [key, field] of Object.entries(node.fields)) {
      fields[key] = withSharedDescriptions(
        field,
        objects.flatMap((v) => v.fields[key] ?? []),
        nullableIsOptional,
      )
    }
    return { ...node, description, fields }
  } else if (node.kind === 'ARRAY') {
    const ofType = withSharedDescriptions(
      node.ofType,
      sources.flatMap((v) => (v.kind === 'ARRAY' ? [v.ofType] : [])),
      nullableIsOptional,
    )
    return { ...node, description, ofType }
  } else if (node.kind === 'UNION') {
    // The members can be of different types, so they are matched by key.
    const members = sources.flatMap((v) => (v.kind === 'UNION' ? v.types : [v]))
    const keys = members.map((v) => buildNodeKey(v, nullableIsOptional))
    const types = node.types.map((member) => {
      const key = buildNodeKey(member, nullableIsOptional)
      return withSharedDescriptions(
        member,
        members.filter((_, i) => keys[i] === key),
        nullableIsOptional,
      )
    })
    return { ...node, description, types }
  }

  return description === (node.description || null)
    ? node
    : { ...node, description }
}

function unifyObjectsIgnoringTypename(
  objects: IRNodeObject[],
  nullableIsOptional: boolean,
): IRNodeObject {
  // We assume these all have the same shape except for possibly
  // different values of `__typename`. So we:
  // 1) Take the first object's fields as a base
  // 2) For `__typename`, merge the values of all objects. A value can be a
  //    union of types or an Exclude<> type.
  // 3) Everything else generates the same type. The objects can be of
  //    different types, so only the descriptions they share are kept.
  // 4) Mark `nonNull: true` if any object is nonNull (OR them together)
  // Note: This function is only called with 2+ objects (single objects are
  // handled by the caller in mergeUnionBranchesIgnoringTypename)

  const base = { ...objects[0]! }
  const mergedFields: Record<string, IRNode> = {}
  for (const [key, field] of Object.entries(base.fields)) {
    mergedFields[key] =
      field.kind === 'TYPENAME'
        ? field
        : withSharedDescriptions(
            field,
            objects.map((obj) => obj.fields[key]!),
            nullableIsOptional,
          )
  }

  let anyNullable = base.nullable
  for (const obj of objects) {
    anyNullable = !anyNullable || !obj.nullable
  }

  // Merge the __typename fields, including aliased ones.
  for (const [key, field] of Object.entries(base.fields)) {
    if (field.kind !== 'TYPENAME') {
      continue
    }
    let typename: IRNodeTypename = field
    for (const obj of objects.slice(1)) {
      const tnField = obj.fields[key]
      if (tnField && tnField.kind === 'TYPENAME') {
        typename = mergeTypenameNodes(typename, tnField)
      }
    }
    // The fields of all objects are optional, or none, because the objects
    // were grouped by how their fields are generated.
    mergedFields[key] = field.optional
      ? { ...typename, optional: true }
      : typename
  }

  return IR.OBJECT({
    ...base,
    fields: mergedFields,
    nullable: !!anyNullable,
  })
}

/**
 * Create a key that describes the generated type of an IR node.
 *
 * Two nodes with the same key generate the same type, except for descriptions.
 *
 * @param ir - The node.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 */
function buildNodeKey(ir: IRNode, nullableIsOptional: boolean): string {
  switch (ir.kind) {
    case 'SCALAR':
      return `S${JSON.stringify(ir.tsType)}`
    case 'TYPENAME':
      return `T(${ir.excludeType ?? ''}:${[...ir.types].sort().join('|')})`
    case 'OBJECT':
      return `O${buildFieldsKey(ir.fields, nullableIsOptional, false)}`
    case 'ARRAY':
      return `A${ir.nullableElement ? '?' : ''}[${buildNodeKey(ir.ofType, nullableIsOptional)}]`
    case 'UNION': {
      // The members are sorted in the output.
      const members = ir.types.map((v) => buildNodeKey(v, nullableIsOptional))
      return `U(${members.sort().join('|')})`
    }
    case 'FRAGMENT_SPREAD':
      // A conditional spread is generated as Partial<>.
      return `F${ir.optional ? '?' : ''}:${ir.fragmentTypeName}`
  }
}

/**
 * Create a key from the fields of an object.
 *
 * The key contains how each field is generated: Whether it's optional, whether
 * it's nullable and its type.
 *
 * @param fields - The fields.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 * @param withoutTypename - Whether to leave out the types of the __typename
 * fields, including aliased ones.
 */
function buildFieldsKey(
  fields: Record<string, IRNode>,
  nullableIsOptional: boolean,
  withoutTypename: boolean,
): string {
  let key = '{'
  for (const [name, child] of Object.entries(fields)) {
    key += name + buildFlagsKey(child, nullableIsOptional)
    key +=
      withoutTypename && child.kind === 'TYPENAME'
        ? 'T'
        : buildNodeKey(child, nullableIsOptional)
    key += ','
  }
  return key + '}'
}

/**
 * Create a key from whether a field is optional or nullable, the way it's
 * generated.
 *
 * @param field - The field.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 */
function buildFlagsKey(field: IRNode, nullableIsOptional: boolean): string {
  if (nullableIsOptional) {
    return field.nullable || field.optional ? '?:' : ':'
  }
  return (field.optional ? '?:' : ':') + (field.nullable ? 'null|' : '')
}

/**
 * Set the __typename fields, including aliased ones.
 *
 * @param fields - The fields. Modified in place.
 * @param typename - The __typename. A conditional __typename stays optional.
 */
export function setTypename(
  fields: Record<string, IRNode>,
  typename: IRNodeTypename,
): void {
  for (const key in fields) {
    const field = fields[key]!
    if (field.kind === 'TYPENAME') {
      fields[key] = field.optional ? { ...typename, optional: true } : typename
    }
  }
}

/**
 * Get a copy of the fields with the given __typename, see setTypename().
 *
 * @param fields - The fields.
 * @param getTypename - Returns the __typename. Only called if there is a __typename field, as it may generate its type.
 *
 * @returns A copy of the fields, or the same fields if they have no __typename.
 */
export function withTypename(
  fields: Record<string, IRNode>,
  getTypename: () => IRNodeTypename,
): Record<string, IRNode> {
  if (!hasAnyTypenameField(fields)) {
    return fields
  }
  const result = { ...fields }
  setTypename(result, getTypename())
  return result
}

/**
 * Whether two branches of an abstract type generate the same type, apart from
 * the types of their __typename fields. Such branches are merged into one, see
 * postProcessIR().
 *
 * This is the same as comparing their keys, but the keys are only created for
 * fields that are not the same node.
 *
 * @param a - The fields of one branch.
 * @param b - The fields of the other branch.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 *
 * @returns True if the branches generate the same type.
 */
export function haveSameFields(
  a: Record<string, IRNode>,
  b: Record<string, IRNode>,
  nullableIsOptional: boolean,
): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) {
    return false
  }
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]!
    if (key !== keysB[i]) {
      return false
    }
    const fieldA = a[key]!
    const fieldB = b[key]!
    if (fieldA === fieldB) {
      continue
    }
    if (
      buildFlagsKey(fieldA, nullableIsOptional) !==
      buildFlagsKey(fieldB, nullableIsOptional)
    ) {
      return false
    }
    // The type of a __typename doesn't count.
    if (fieldA.kind === 'TYPENAME' && fieldB.kind === 'TYPENAME') {
      continue
    }
    if (
      buildNodeKey(fieldA, nullableIsOptional) !==
      buildNodeKey(fieldB, nullableIsOptional)
    ) {
      return false
    }
  }
  return true
}

/**
 * If we do the "full" selection building in Generator.buildAbstractSelectionSet,
 * we end up with a lot of object shapes in the union that are basically identical,
 * except for the value of __typename.
 *
 * This method will merge such identical shapes into one.
 *
 * @TODO: This could already be handled in buildAbstractSelectionSet.
 */
function mergeUnionBranchesIgnoringTypename(
  branches: IRNode[],
  nullableIsOptional: boolean,
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

  // Group the OBJECT branches by their fields, ignoring the types of their
  // __typename fields. The __typename fields of a group are merged. The
  // nullable and optional flags of a branch itself are not part of its type.
  const groups = new Map<string, IRNodeObject[]>()

  for (const obj of objectBranches) {
    const sig = buildFieldsKey(obj.fields, nullableIsOptional, true)
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
    const merged = unifyObjectsIgnoringTypename(objs, nullableIsOptional)
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
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields. Branches that only differ in whether a field is nullable or
 * optional are then merged.
 *
 * @returns The processed, new node or the passed in node if unprocessed.
 */
export function postProcessIR(ir: IRNode, nullableIsOptional = false): IRNode {
  switch (ir.kind) {
    case 'SCALAR':
    case 'FRAGMENT_SPREAD':
    case 'TYPENAME':
      return ir

    case 'OBJECT': {
      const newFields: Record<string, IRNode> = {}
      for (const [fieldName, fieldIR] of Object.entries(ir.fields)) {
        newFields[fieldName] = postProcessIR(fieldIR, nullableIsOptional)
      }

      return {
        ...ir,
        fields: newFields,
      }
    }

    case 'ARRAY': {
      return {
        ...ir,
        ofType: postProcessIR(ir.ofType, nullableIsOptional),
      }
    }

    case 'UNION': {
      // First recurse into each branch
      const processedBranches = ir.types.map((t) =>
        postProcessIR(t, nullableIsOptional),
      )
      return {
        ...ir,
        types: mergeUnionBranchesIgnoringTypename(
          processedBranches,
          nullableIsOptional,
        ),
      }
    }
  }
}

/**
 * Whether the node has nested selections, such as an object, a union or a list
 * of them.
 */
export function hasNestedSelections(ir: IRNode): boolean {
  if (ir.kind === 'OBJECT' || ir.kind === 'UNION') {
    return true
  } else if (ir.kind === 'ARRAY') {
    return hasNestedSelections(ir.ofType)
  }
  return false
}

/**
 * If we have a field named __typename in the given fields, return true
 */
export function hasTypenameField(fields: Record<string, IRNode>): boolean {
  return fields[TYPENAME] !== undefined
}

/**
 * Whether the fields have a __typename field, including aliased ones.
 */
export function hasAnyTypenameField(fields: Record<string, IRNode>): boolean {
  for (const key in fields) {
    if (fields[key]!.kind === 'TYPENAME') {
      return true
    }
  }
  return false
}

/**
 * Whether the fields have a __typename field that is always present, so not
 * conditional.
 */
export function hasRequiredTypenameField(
  fields: Record<string, IRNode>,
): boolean {
  const field = fields[TYPENAME]
  return !!field && !field.optional
}

/**
 * Get the fields that a fragment selects.
 *
 * @param ir - The IR of the fragment.
 * @param nullableIsOptional - Whether nullable fields are generated as
 * optional fields.
 *
 * @returns The fields. For a union, the fields of all its object branches.
 */
export function buildFragmentIRFields(
  ir: IRNode,
  nullableIsOptional = false,
): Record<string, IRNode> {
  // If it's an OBJECT node, just return its fields.
  if (ir.kind === 'OBJECT') {
    return ir.fields
  }

  // If it's a UNION, unify all OBJECT branches. Only one of them applies to
  // an object, so a field is only present if all branches select it.
  if (ir.kind === 'UNION') {
    const branches = ir.types.filter((v) => v.kind === 'OBJECT')
    let merged: Record<string, IRNode> | null = null
    for (const branch of branches) {
      merged = merged
        ? mergeObjectFields(merged, branch.fields, true, true)
        : { ...branch.fields }
    }
    if (!merged) {
      return {}
    }

    // The branches are of different types, so only the descriptions they
    // share are kept.
    for (const [key, field] of Object.entries(merged)) {
      merged[key] = withSharedDescriptions(
        field,
        branches.flatMap((v) => v.fields[key] ?? []),
        nullableIsOptional,
      )
    }
    return merged
  }

  // There are no fields.
  return {}
}
