import { UnreachableError } from '../errors'

/**
 * Marks a code path as unreachable.
 *
 * This function is used for defensive programming - it should never be called
 * at runtime. If it is called, it throws an UnreachableError with context about
 * what went wrong.
 *
 * The function is excluded from code coverage since it represents code paths
 * that should be impossible to reach with valid input.
 *
 * @param message - Description of what invariant was violated
 * @returns never - This function never returns normally
 * @throws {@link UnreachableError}
 *
 * @example
 * ```ts
 * function processType(type: GraphQLType) {
 *   if (isObjectType(type)) {
 *     return handleObject(type)
 *   } else if (isAbstractType(type)) {
 *     return handleAbstract(type)
 *   }
 *   // Should never reach here with valid GraphQL
 *   unreachable('Unexpected type in processType: ' + type.name)
 * }
 * ```
 */
/* v8 ignore start */
export function unreachable(message: string): never {
  throw new UnreachableError(message)
}
/* v8 ignore stop */
