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
      'graphql/language/printer': 'graphql/language/printer.js',
      'graphql/language': 'graphql/language/index.js',
      graphql: 'graphql/index.js',
    },
  },
})
