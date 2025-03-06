const RESERVED = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

export class MinifyVariableName {
  /*
   * Mapping from original names to minified names.
   */
  private mapping: Map<string, string> = new Map()

  /**
   * The current index.
   */
  private index: number = 0

  constructor(private isEnabled?: boolean) {}

  /**
   * Returns a minified valid JS variable name for the given name.
   *
   * @param name The original variable name.
   */
  public getVarName(name: string): string {
    if (!this.isEnabled) {
      return name
    }

    if (this.mapping.has(name)) {
      return this.mapping.get(name)!
    }

    let varName: string
    // Generate the next valid variable name.
    do {
      varName = this.numToVarName(this.index++)
    } while (RESERVED.has(varName))

    this.mapping.set(name, varName)
    return varName
  }

  /**
   * Converts a number to a minified variable name using a base-26.
   *
   * @param num The number to convert.
   */
  private numToVarName(num: number): string {
    let name = ''
    do {
      name = String.fromCharCode(97 + (num % 26)) + name
      num = Math.floor(num / 26) - 1
    } while (num >= 0)
    return name
  }
}
