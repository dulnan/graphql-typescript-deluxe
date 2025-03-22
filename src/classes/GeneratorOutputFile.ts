import type { GeneratedCodeOutputType } from '../types'
import { DependencyAware } from './DependencyAware'

export type GeneratorOutputFileType = GeneratedCodeOutputType | 'json'

export class GeneratorOutputFile extends DependencyAware {
  constructor(
    private readonly source: string,
    dependencies: string[] = [],
    public readonly type: GeneratorOutputFileType = 'ts',
  ) {
    super(dependencies)
  }

  /**
   * Get the source code.
   */
  getSource(): string {
    return this.source
  }
}
