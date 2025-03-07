export { Generator } from './generator'
export type { GeneratorOptions, GeneratorOptionsOutput } from './types/options'
export type { GeneratorOutput } from './classes/GeneratorOutput'
export type { GeneratorOutputCode } from './classes/GeneratorOutputCode'
export type { GeneratorOutputOperation } from './classes/GeneratorOutputOperation'
export type { DependencyAware } from './classes/DependencyAware'
export type { MinifyVariableName } from './classes/MinifyVariableName'

export {
  TypeNotFoundError,
  FragmentNotFoundError,
  FieldNotFoundError,
  MissingRootTypeError,
  LogicError,
  DuplicateInputDocumentError,
  NodeLocMissingError,
  InvalidOptionError,
} from './errors'
