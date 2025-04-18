import { NO_FILE_PATH } from '../constants'
import type { TypeContext } from '../types'
import { stripIgnoredCharacters } from 'graphql'
import type { TypeCommentOptions } from '../types/options'

function escapeStringForComment(input: string): string {
  return input.replace(/\*\//g, '*\\/')
}

function toTSComment(lines: string[]): string {
  if (lines.length === 0) {
    return '/**\n */'
  } else if (lines.length === 1) {
    return `/** ${escapeStringForComment(lines[0]!)} */`
  }

  const commentLines = lines.map((line) => ` * ${escapeStringForComment(line)}`)
  return ['/**', ...commentLines, ' */'].join('\n')
}

/**
 * Creates a comment from a string, escaping any characters that might close the comment.
 */
export function makeComment(input: string): string {
  if (input.includes('\n')) {
    return toTSComment(input.split('\n'))
  }
  return `/** ${escapeStringForComment(input)} */`
}

export function makeTypeDoc(
  context: TypeContext,
  options: Record<TypeCommentOptions, boolean>,
): string {
  const lines: string[] = []
  const filePath = context.filePath
  const description = (context.type?.description || '').trim()
  if (description && options.typeDescription) {
    lines.push(description)
  }
  if (filePath && filePath !== NO_FILE_PATH && options.link) {
    if (lines.length) {
      lines.push('')
    }
    lines.push(`@see {@link file://${filePath}}`)
  }
  if (context.definition?.loc && options.source) {
    const loc = context.definition.loc
    const source = loc.source.body.slice(loc.start, loc.end)
    if (source) {
      if (lines.length) {
        lines.push('')
      }
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

export function makeExport(name: string, type: string): string {
  return `export type ${name} = ${type};`
}

/**
 * Transforms the given GraphQl source to a full JavaScript string.
 */
export function graphqlToString(str: string, minify = false): string {
  const strStripped = minify ? stripIgnoredCharacters(str) : str
  // Since we are using String.raw to keep GraphQL quote escaping intact, we have to "escape" backtics ourselves.
  const escapedBackticks = strStripped.replaceAll('`', '${"`"}')
  return 'String.raw`' + escapedBackticks + (minify ? '`' : '\n\n`')
}

export function generateHeaderComment(title: string): string {
  return ['// ' + '-'.repeat(80), '// ' + title, '// ' + '-'.repeat(80)].join(
    '\n',
  )
}
