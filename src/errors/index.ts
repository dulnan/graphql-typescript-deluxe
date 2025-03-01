export class DocumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocumentError'
    Object.setPrototypeOf(this, DocumentError.prototype)
  }
}

export class SelectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SelectionError'
    Object.setPrototypeOf(this, SelectionError.prototype)
  }
}

export class TypeNotFoundError extends Error {
  constructor(type: string) {
    super('Type not found: ' + type)
    this.name = 'TypeNotFoundError'
    Object.setPrototypeOf(this, TypeNotFoundError.prototype)
  }
}

export class FragmentNotFoundError extends Error {
  constructor(name: string) {
    super('Fragment not found: ' + name)
    this.name = 'FragmentNotFoundError'
    Object.setPrototypeOf(this, FragmentNotFoundError.prototype)
  }
}

export class FieldNotFoundError extends Error {
  constructor(field: string, type: string) {
    super(`Field "${field} not found on type "${type}"`)
    this.name = 'FieldNotFoundError'
    Object.setPrototypeOf(this, FieldNotFoundError.prototype)
  }
}

export class MissingRootTypeError extends Error {
  constructor(type: string) {
    super('Missing root type: ' + type)
    this.name = 'MissingRootTypeError'
    Object.setPrototypeOf(this, MissingRootTypeError.prototype)
  }
}

export class LogicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LogicError'
    Object.setPrototypeOf(this, LogicError.prototype)
  }
}

export class DuplicateInputDocument extends Error {
  constructor(filePath: string) {
    super(`The input document already exists: ${filePath}`)
    this.name = 'DuplicateInputDocument'
    Object.setPrototypeOf(this, DuplicateInputDocument.prototype)
  }
}
