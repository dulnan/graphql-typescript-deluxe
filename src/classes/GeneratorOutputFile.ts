import { DependencyAware } from './DependencyAware'

export class GeneratorOutputFile extends DependencyAware {
  constructor(
    private readonly source: string,
    dependencies: string[] = [],
  ) {
    super(dependencies)
  }

  getSource(): string {
    return this.source
  }
}
