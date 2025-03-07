import type { RedundantFragmentSpreadMutation } from './result'

export default function (v: RedundantFragmentSpreadMutation): void {
  console.log(v.createUserInline.inlineErrors)
  console.log(v.createUserSpread.errors)
  console.log(v.createUserSpread.mergedErrors)
  console.log(v.createUserInlineBoth.mergedErrors)
  console.log(v.createUserInlineBoth.errors)
  console.log(v.createUserInlineBoth.inlineErrors)
}
