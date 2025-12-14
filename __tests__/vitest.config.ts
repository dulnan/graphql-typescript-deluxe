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
    alias: {
      graphql: 'graphql/index.js',
    },
  },
})
