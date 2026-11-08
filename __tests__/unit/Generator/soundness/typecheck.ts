import path from 'node:path'
import ts from 'typescript'

const COMPILER_OPTIONS: ts.CompilerOptions = {
  strict: true,
  noUnusedLocals: true,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.Preserve,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts'],
  types: [],
}

/**
 * The lib files, parsed once for all programs.
 */
const libFiles = new Map<string, ts.SourceFile | undefined>()

type Diagnostic = {
  fileName: string

  /**
   * The line, starting at 0.
   */
  line: number

  message: string
}

/**
 * Type-check files that only exist in memory, in one program.
 *
 * @param files - The source of each file, by absolute path.
 *
 * @returns The errors.
 */
export function typecheck(files: Map<string, string>): Diagnostic[] {
  const directories = new Set<string>()
  for (const fileName of files.keys()) {
    for (let dir = path.dirname(fileName); !directories.has(dir);) {
      directories.add(dir)
      dir = path.dirname(dir)
    }
  }

  const host = ts.createCompilerHost(COMPILER_OPTIONS)
  const { getSourceFile, fileExists, readFile, directoryExists } = host
  host.getSourceFile = (
    fileName,
    languageVersion,
    ...rest
  ): ts.SourceFile | undefined => {
    const source = files.get(fileName)
    if (source !== undefined) {
      return ts.createSourceFile(fileName, source, languageVersion)
    }
    if (!libFiles.has(fileName)) {
      libFiles.set(fileName, getSourceFile(fileName, languageVersion, ...rest))
    }
    return libFiles.get(fileName)
  }
  host.fileExists = (fileName): boolean =>
    files.has(fileName) || fileExists(fileName)
  host.readFile = (fileName): string | undefined =>
    files.get(fileName) ?? readFile(fileName)
  host.directoryExists = (name): boolean =>
    directories.has(name) || !!directoryExists?.(name)

  const program = ts.createProgram([...files.keys()], COMPILER_OPTIONS, host)
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => ({
    fileName: diagnostic.file?.fileName ?? '',
    line:
      diagnostic.file && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line
        : 0,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  }))
}
