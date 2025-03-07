import { NO_FILE_PATH } from '../constants'
import { LogicError } from '../errors'
import type { GeneratedCodeType } from '../types'

export const KEY_SEPARATOR = '#####'

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
   * The current stack index.
   */
  private currentIndex = -1

  /**
   * Add a dependency to the current stack.
   */
  public add(type: GeneratedCodeType, name: string): void {
    this.addToCurrent(DependencyTracker.toKey(type, name))
  }

  /**
   * Add a dependency to the current stack.
   */
  public addFragment(name: string): void {
    this.addToCurrent(DependencyTracker.toKey('fragment-name', name))
  }

  /**
   * Generate a dependency key.
   */
  public static toKey(type: string, key: string): string {
    return type + KEY_SEPARATOR + key
  }

  /**
   * Adds a key to the current set.
   */
  private addToCurrent(key: string): void {
    if (!this.stack[this.currentIndex]) {
      throw new LogicError('Tried to add dependency but no stack available.')
    }
    this.stack[this.currentIndex]!.add(key)
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
  public merge(data: { dependencies?: string[]; filePath?: string }): void {
    if (data.filePath) {
      this.addFileDependency(data.filePath)
    }

    // Also bubble the dependencies to all upper stacks.
    if (data.dependencies) {
      for (let i = 0; i <= this.currentIndex; i++) {
        for (let j = 0; j < data.dependencies.length; j++) {
          this.stack[i]?.add(data.dependencies[j]!)
        }
      }
    }
  }

  /**
   * Start a new dependency tracking stack.
   */
  public start(currentFile?: string): void {
    this.stack.push(new Set())
    this.currentIndex++
    if (currentFile) {
      this.currentFilePath = currentFile
      this.addFileDependency(currentFile)
    }
  }

  /**
   * End the current dependency tracking stack, merging its dependencies
   * to the parent stack (if any) and returning the collected dependencies.
   */
  public end(): string[] {
    if (this.currentIndex < 0) {
      throw new LogicError(
        'Tried to pop dependency stack, but no stack available.',
      )
    }
    const currentSet = this.stack.pop()!
    // Always add the file dependency for the current file.
    currentSet.add(DependencyTracker.toKey('file', this.currentFilePath))
    const dependencies = Array.from(currentSet)
    this.currentIndex--
    // If there’s a parent stack, merge the popped dependencies into it.
    if (this.currentIndex >= 0) {
      this.merge({ dependencies, filePath: this.getCurrentFile() })
    }
    return dependencies
  }

  public reset(): void {
    this.stack = []
    this.currentIndex = -1
    this.currentFilePath = NO_FILE_PATH
  }

  /**
   * Get the current file.
   */
  public getCurrentFile(): string {
    return this.currentFilePath
  }

  /**
   * Whether we have a current stack.
   */
  public hasStack(): boolean {
    return this.currentIndex >= 0
  }
}
