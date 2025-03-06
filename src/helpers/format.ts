import ts from 'typescript'

/**
 * Formats a string of TypeScript code.
 *
 * @param code - A string containing valid TypeScript code.
 * @returns The formatted TypeScript code.
 */
export function formatCode(code: string): string {
  // Create a source file from the input code
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
  )

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false,
    noEmitHelpers: true,
  })

  return printer.printFile(sourceFile)
}
