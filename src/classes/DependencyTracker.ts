import { NO_FILE_PATH } from '../constants'
import { LogicError } from '../errors'
import type { GeneratedCodeType } from '../types'

const KEY_SEPARATOR = '#####'

export class DependencyTracker {
  private currentFilePath = NO_FILE_PATH
  private stack: Set<string>[] = []

  add(type: GeneratedCodeType, name: string): void {
    this.addToCurrent(DependencyTracker.toKey(type, name))
  }

  static toKey(type: string, key: string): string {
    return type + KEY_SEPARATOR + key
  }

  private addToCurrent(key: string): void {
    const currentStack = this.stack[this.stack.length - 1]
    if (!currentStack) {
      throw new LogicError('Tried to add dependency but no stack available.')
    }
    currentStack.add(key)
  }

  private addFileDependency(filePath: string): void {
    this.addToCurrent(DependencyTracker.toKey('file', filePath))
  }

  merge(data: { dependencies: string[]; filePath: string }): void {
    this.addFileDependency(data.filePath)
    data.dependencies.forEach((key) => this.addToCurrent(key))
  }

  start(currentFile?: string): void {
    this.stack.push(new Set())
    if (currentFile) {
      this.currentFilePath = currentFile
      this.addFileDependency(currentFile)
    }
  }

  end(): string[] {
    const last = this.stack.pop()
    if (!last) {
      throw new LogicError(
        'Tried to pop dependency stack, but no stack available.',
      )
    }
    last.add(DependencyTracker.toKey('file', this.currentFilePath))
    const dependencies = [...last.values()]
    if (this.stack.length) {
      this.merge({ dependencies, filePath: this.getCurrentFile() })
    }
    return dependencies
  }

  getCurrentFile(): string {
    return this.currentFilePath
  }

  hasStack(): boolean {
    return this.stack.length > 0
  }
}
