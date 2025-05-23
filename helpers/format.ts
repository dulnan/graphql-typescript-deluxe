import * as prettier from 'prettier'

export function format(v: string): Promise<string> {
  return prettier.format(v, {
    parser: 'typescript',
    proseWrap: 'always',
    semi: false,
    singleQuote: true,
    arrowParens: 'always',
    printWidth: 80,
    trailingComma: 'all',
  })
}
