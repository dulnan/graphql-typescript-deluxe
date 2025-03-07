/**
 * Very basic and primitive formatting.
 *
 * This works because we know exactly how the input is going to be, so we can
 * basically just iterate line by line and look at the presence of certain
 * characters.
 *
 * @param code - The code to format.
 *
 * @returns The formatted TypeScript code.
 */
export function formatCode(input: string): string {
  const lines = input.split('\n')
  let output = ''
  let level = 0

  const add = (line: string): void => {
    const spaces = ' '.repeat(level * 2)
    output += `${spaces}${line}\n`
  }

  const increment = (): void => {
    level++
  }

  const decrement = (): void => {
    level = Math.max(0, level - 1)
  }

  for (const line of lines) {
    if (line.startsWith(' * ')) {
      add(line)
    } else if (line.startsWith('/**') || line.endsWith('*/')) {
      add(line)
    } else if (line.includes('}') && line.includes('{')) {
      decrement()
      add(line)
      increment()
    } else if (line.includes('{')) {
      add(line)
      increment()
    } else if (line.includes('}')) {
      decrement()
      add(line)
    } else {
      add(line)
    }
  }

  // Removes trailing new lines and spaces.
  return output.trim()
}
