import { NO_FILE_PATH } from '../constants'
import type { TypeContext } from '../types'
import { stripIgnoredCharacters } from 'graphql'

export function escapeStringForComment(input: string): string {
  return input.replace(/\*\//g, '*\\/')
}

/**
 * Creates a comment from a string, escaping any characters that might close the comment.
 */
export function makeComment(input: string): string {
  return `/** ${escapeStringForComment(input)} */`
}

export function toTSComment(lines: string[]): string {
  if (lines.length === 0) {
    return '/**\n */'
  } else if (lines.length === 1) {
    return `/** ${escapeStringForComment(lines[0]!)} */`
  }

  const commentLines = lines.map((line) => ` * ${escapeStringForComment(line)}`)
  return ['/**', ...commentLines, ' */'].join('\n')
}

export function makeTypeDoc(context: TypeContext): string {
  const lines: string[] = []
  const filePath = context.input?.filePath || context.filePath
  if (context.type?.description) {
    lines.push(context.type.description)
  }
  if (filePath && filePath !== NO_FILE_PATH) {
    lines.push(`@see {@link file://${filePath}}`, '')
  }
  if (context.definition?.loc) {
    const loc = context.definition.loc
    const source = loc.source.body.slice(loc.start, loc.end)
    if (source) {
      lines.push('@example')
      lines.push('```graphql')
      source.split('\n').forEach((line) => lines.push(line))
      lines.push('```')
    }
  }

  if (!lines.length) {
    return ''
  }

  return toTSComment(lines)
}

export function makeExport(
  name: string,
  type: string,
  comment?: string | null,
): string {
  const code = `export type ${name} = ${type};`
  if (comment) {
    return `${makeComment(comment)}\n${code}`
  }
  return code
}

/**
 * Transforms the given GraphQl source to a full JavaScript string.
 */
export function graphqlToString(str: string): string {
  return '`' + stripIgnoredCharacters(str).replaceAll('`', '\\`') + '`'
}
