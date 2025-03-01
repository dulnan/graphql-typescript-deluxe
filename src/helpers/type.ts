export function notNullish<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? {
        [P in keyof T]-?: DeepRequired<T[P]>
      }
    : T
