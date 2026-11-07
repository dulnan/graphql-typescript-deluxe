import { format as oxfmt } from 'oxfmt'

export async function format(v: string): Promise<string> {
  const result = await oxfmt('output.ts', v, {
    semi: false,
    singleQuote: true,
    arrowParens: 'always',
    printWidth: 80,
    trailingComma: 'all',
  })

  if (result.errors.length) {
    throw new Error(result.errors.map((e) => e.message).join('\n'))
  }

  return result.code
}
