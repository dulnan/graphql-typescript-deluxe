import type { DefaultValuesQueryVariables } from './result.js'

export const withRequired: DefaultValuesQueryVariables = {
  bundleRequired: 'Foobar',
}

export const withAll: DefaultValuesQueryVariables = {
  bundleRequired: 'Foobar',
  bundle: null,
}
