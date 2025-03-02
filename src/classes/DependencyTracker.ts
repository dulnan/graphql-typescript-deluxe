import { NO_FILE_PATH } from '../constants'
import { LogicError } from '../errors'
import type { GeneratedCodeType } from '../types'

const KEY_SEPARATOR = '#####'

export class DependencyTracker {
  /**
   * The current file path.
   */
  private currentFilePath = NO_FILE_PATH

  /**
   * The created sets.
   */
  private stack: Set<string>[] = []

  /**
   * The current stack depth.
   */
  private depth = 0

  /**
   * Add a dependency to the current stack.
   */
  add(type: GeneratedCodeType, name: string): void {
    this.addToCurrent(DependencyTracker.toKey(type, name))
  }

  /**
   * Generate a dependency key.
   */
  static toKey(type: string, key: string): string {
    return type + KEY_SEPARATOR + key
  }

  /**
   * Adds a key to the current set.
   */
  private addToCurrent(key: string): void {
    if (this.depth === 0) {
      throw new LogicError('Tried to add dependency but no stack available.')
    }
    this.stack[this.depth - 1]!.add(key)
  }

  /**
   * Add a file dependency.
   */
  private addFileDependency(filePath: string): void {
    this.addToCurrent(DependencyTracker.toKey('file', filePath))
  }

  /**
   * Merge the given dependency data with the current stack.
   */
  merge(data: { dependencies: string[]; filePath: string }): void {
    this.addFileDependency(data.filePath)
    for (let i = 0; i < data.dependencies.length; i++) {
      this.addToCurrent(data.dependencies[i]!)
    }
  }

  /**
   * Start a new dependency tracking stack.
   */
  start(currentFile?: string): void {
    if (this.depth < this.stack.length) {
      // Reuse an existing set by clearing it.
      this.stack[this.depth]!.clear()
    } else {
      // Otherwise, allocate a new set.
      this.stack.push(new Set<string>())
    }
    this.depth++
    if (currentFile) {
      this.currentFilePath = currentFile
      this.addFileDependency(currentFile)
    }
  }

  /**
   * End the current dependency tracking stack, merging its dependencies
   * to the parent stack (if any) and returning the collected dependencies.
   */
  end(): string[] {
    if (this.depth === 0) {
      throw new LogicError(
        'Tried to pop dependency stack, but no stack available.',
      )
    }
    const currentSet = this.stack[this.depth - 1]!
    // Always add the file dependency for the current file.
    currentSet.add(DependencyTracker.toKey('file', this.currentFilePath))
    const dependencies = Array.from(currentSet)
    this.depth--
    // If there’s a parent stack, merge the popped dependencies into it.
    if (this.depth > 0) {
      this.merge({ dependencies, filePath: this.getCurrentFile() })
    }
    return dependencies
  }

  /**
   * Get the current file.
   */
  getCurrentFile(): string {
    return this.currentFilePath
  }

  /**
   * Whether we have a current stack.
   */
  hasStack(): boolean {
    return this.depth > 0
  }
}
