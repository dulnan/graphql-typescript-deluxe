import type { GeneratedCodeType } from '../types'
import { KEY_SEPARATOR } from './DependencyTracker'

type MappedDependencyType = GeneratedCodeType | 'fragment-name'

type MappedDependency = {
  type: MappedDependencyType
  value: string
}

function mapDependencies(dependencies?: string[]): MappedDependency[] {
  if (!dependencies) {
    return []
  }
  return dependencies.map((dependency) => {
    const [type, value] = dependency.split(KEY_SEPARATOR)
    return {
      type: type as MappedDependencyType,
      value: value || '',
    }
  })
}

export class DependencyAware {
  private mappedDependencies: MappedDependency[] | null = null

  constructor(private dependencies: string[]) {}

  /**
   * Get the mapped dependencies.
   *
   * @param type - Optionally filter for the given dependency type.
   *
   * @returns The mapped dependencies.
   */
  public getDependencies(
    type?: MappedDependencyType,
  ): readonly MappedDependency[] {
    if (this.mappedDependencies === null) {
      this.mappedDependencies = mapDependencies(this.dependencies)
    }

    if (type) {
      return this.mappedDependencies.filter((v) => v.type === type)
    }

    return this.mappedDependencies
  }

  /**
   * Returns the GraphQL name of all fragment dependencies.
   *
   * @returns The name of fragment dependencies.
   */
  public getGraphQLFragmentDependencies(): string[] {
    return this.getDependencies('fragment-name').map((v) => v.value)
  }

  /**
   * Returns the TypeScript name of enum dependencies.
   *
   * @returns The name of enum dependencies.
   */
  public getTypeScriptEnumDependencies(): string[] {
    return this.getDependencies('enum').map((v) => v.value)
  }
}
