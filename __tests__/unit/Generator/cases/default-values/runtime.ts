import type { DefaultValuesQueryVariables } from './result'

export const withRequired: DefaultValuesQueryVariables = {
  bundleRequired: 'Foobar',
}

export const withAll: DefaultValuesQueryVariables = {
  bundleRequired: 'Foobar',
  bundle: null,
}
