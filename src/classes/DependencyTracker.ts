import { NO_FILE_PATH } from '../constants'
import { LogicError } from '../errors'
import type { GeneratedCodeType } from '../types'

export const KEY_SEPARATOR = '#####'

export class DependencyTracker {
  /**
   * The stack of dependency sets, each with the file it belongs to.
   */
  private stack: { dependencies: Set<string>; filePath: string }[] = []

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
    const current = this.stack.at(-1)
    if (!current) {
      throw new LogicError('Tried to add dependency but no stack available.')
    }
    current.dependencies.add(key)
  }

  /**
   * Add a file dependency.
   */
  public addFileDependency(filePath: string): void {
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
      for (const item of this.stack) {
        for (const dependency of data.dependencies) {
          item.dependencies.add(dependency)
        }
      }
    }
  }

  /**
   * Start a new dependency tracking stack.
   *
   * @param currentFile - The file that the stack belongs to. Defaults to the file of the parent stack.
   */
  public start(currentFile?: string): void {
    const filePath = currentFile || this.getCurrentFile()
    this.stack.push({ dependencies: new Set(), filePath })
    if (filePath) {
      this.addFileDependency(filePath)
    }
  }

  /**
   * End the current dependency tracking stack, merging its dependencies
   * to the parent stack (if any) and returning the collected dependencies.
   *
   * The current file is then the one of the parent stack again.
   */
  public end(): string[] {
    const current = this.stack.pop()
    if (!current) {
      throw new LogicError(
        'Tried to pop dependency stack, but no stack available.',
      )
    }
    // Always add the file dependency for the file of the stack.
    current.dependencies.add(DependencyTracker.toKey('file', current.filePath))
    const dependencies = Array.from(current.dependencies)
    // If there’s a parent stack, merge the popped dependencies into it.
    if (this.stack.length) {
      this.merge({ dependencies })
    }
    return dependencies
  }

  public reset(): void {
    this.stack = []
  }

  /**
   * Get the file of the current stack.
   */
  public getCurrentFile(): string {
    return this.stack.at(-1)?.filePath ?? NO_FILE_PATH
  }

  /**
   * Whether we have a current stack.
   */
  public hasStack(): boolean {
    return this.stack.length > 0
  }
}
