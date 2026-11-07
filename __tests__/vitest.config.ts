import { createRequire } from 'node:module'
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'build/**/*'],
    coverage: {
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'build/**/*',
        'benchmark/**/*',
        'helpers/**/*',
        'scripts/**/*',
        'examples/**/*',
        'knip.ts',
      ],
    },
  },

  resolve: {
    alias: [
      // Resolve "graphql" to the same file Node.js loads for externalized
      // dependencies such as @graphql-tools/load. Vite resolves with different
      // conditions ("module", "development"), which would load a second
      // instance and fail graphql's instanceof checks.
      {
        find: /^graphql$/,
        replacement: createRequire(import.meta.url).resolve('graphql'),
      },
    ],
  },
})
