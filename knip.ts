import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/index.ts',
    'benchmark/index.cjs',
    'benchmark/app.ts',
    'examples/*/index.mjs',
    'examples/*/app.ts',
    'scripts/*.{js,cjs}',
  ],
  project: [
    'src/**/*.ts',
    'helpers/**/*.ts',
    'scripts/**/*.{ts,js,cjs,mjs}',
    'examples/**/*.{ts,mjs}',
    'benchmark/**/*.{ts,cjs}',
  ],
  ignoreDependencies: [
    // Used via jiti for TypeScript runtime compilation
    'jiti',
    // Used by eslint config
    '@types/eslint__js',
    '@typescript-eslint/parser',
    // Used via tsconfig paths
    'tslib',
    // Used for vitest types
    'vite',
    // Transitive dependency from @graphql-codegen/typescript-operations
    '@graphql-codegen/typescript',
  ],
  ignore: [
    // Generated output files
    'examples/watcher/output/**',
  ],
}

export default config
