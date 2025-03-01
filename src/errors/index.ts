/**
 * Thrown when an abstract or object type is referenced that does not exist.
 */
export class TypeNotFoundError extends Error {
  constructor(type: string) {
    super('Type not found: ' + type)
    this.name = 'TypeNotFoundError'
    Object.setPrototypeOf(this, TypeNotFoundError.prototype)
  }
}

/**
 * Thrown when a fragment is referenced that does not exist.
 */
export class FragmentNotFoundError extends Error {
  constructor(name: string) {
    super('Fragment not found: ' + name)
    this.name = 'FragmentNotFoundError'
    Object.setPrototypeOf(this, FragmentNotFoundError.prototype)
  }
}

/**
 * Thrown when a field does not exist.
 */
export class FieldNotFoundError extends Error {
  constructor(field: string, type: string) {
    super(`Field "${field} not found on type "${type}"`)
    this.name = 'FieldNotFoundError'
    Object.setPrototypeOf(this, FieldNotFoundError.prototype)
  }
}

/**
 * Thrown when an unexpected root type is encountered.
 */
export class MissingRootTypeError extends Error {
  constructor(type: string) {
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
  constructor(message: string) {
    super(message)
    this.name = 'LogicError'
    Object.setPrototypeOf(this, LogicError.prototype)
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
