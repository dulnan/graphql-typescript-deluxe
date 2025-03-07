export type ErrorContext = {
  filePath?: string
}

/**
 * Thrown when an abstract or object type is referenced that does not exist.
 */
export class TypeNotFoundError extends Error {
  constructor(
    type: string,
    public context?: ErrorContext,
  ) {
    super('Type not found: ' + type)
    this.name = 'TypeNotFoundError'
    Object.setPrototypeOf(this, TypeNotFoundError.prototype)
  }
}

/**
 * Thrown when a fragment is referenced that does not exist.
 */
export class FragmentNotFoundError extends Error {
  constructor(
    name: string,
    public context?: ErrorContext,
  ) {
    super('Fragment not found: ' + name)
    this.name = 'FragmentNotFoundError'
    Object.setPrototypeOf(this, FragmentNotFoundError.prototype)
  }
}

/**
 * Thrown when a field does not exist.
 */
export class FieldNotFoundError extends Error {
  constructor(
    public fieldName: string,
    public typeName: string,
    public context?: ErrorContext,
  ) {
    super(`Field "${fieldName} not found on type "${typeName}"`)
    this.name = 'FieldNotFoundError'
    Object.setPrototypeOf(this, FieldNotFoundError.prototype)
  }
}

/**
 * Thrown when an unexpected root type is encountered.
 */
export class MissingRootTypeError extends Error {
  constructor(
    type: string,
    public context?: ErrorContext,
  ) {
    super('Missing root type: ' + type)
    this.name = 'MissingRootTypeError'
    Object.setPrototypeOf(this, MissingRootTypeError.prototype)
  }
}

/**
 * Thrown when the generator itself encountered a logic error.
 * Likely a bug in the generator.
 */
export class LogicError extends Error {
  constructor(
    message: string,
    public context?: ErrorContext,
  ) {
    super(message)
    this.name = 'LogicError'
    Object.setPrototypeOf(this, LogicError.prototype)
  }
}

/**
 * Thrown when the build phase finishes with an inconsistent dependency tracking state.
 */
export class DependencyTrackingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DependencyTrackingError'
    Object.setPrototypeOf(this, DependencyTrackingError.prototype)
  }
}

/**
 * Thrown when attempting to add an input document that already exists.
 */
export class DuplicateInputDocumentError extends Error {
  constructor(filePath: string) {
    super(`The input document already exists: ${filePath}`)
    this.name = 'DuplicateInputDocumentError'
    Object.setPrototypeOf(this, DuplicateInputDocumentError.prototype)
  }
}

/**
 * Thrown when the AST source code is required.
 */
export class NodeLocMissingError extends Error {
  constructor(name: string) {
    super(`Missing node.loc for: ${name}`)
    this.name = 'NodeLocMissingError'
    Object.setPrototypeOf(this, NodeLocMissingError.prototype)
  }
}

/**
 * Thrown when an invalid option is provided.
 */
export class InvalidOptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidOptionError'
    Object.setPrototypeOf(this, InvalidOptionError.prototype)
  }
}
