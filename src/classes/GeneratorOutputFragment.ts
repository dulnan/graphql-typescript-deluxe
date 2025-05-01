import type { FragmentDefinitionNode } from 'graphql'
import type { CollectedFragment } from '../types'
import { DependencyAware } from './DependencyAware'

export class GeneratorOutputFragment
  extends DependencyAware
  implements Omit<CollectedFragment, 'dependencies'>
{
  /**
   * The fragment node.
   */
  public readonly node: FragmentDefinitionNode

  /**
   * The filePath of the source input document.
   */
  public readonly filePath: string

  constructor(fragment: CollectedFragment) {
    super(fragment.dependencies)
    this.filePath = fragment.filePath
    this.node = fragment.node
  }
}
