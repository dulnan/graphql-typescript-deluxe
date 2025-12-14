# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

graphql-typescript-deluxe is a fast, stateful TypeScript code generator for GraphQL operations and fragments. It's designed as a high-performance alternative to graphql-codegen, with ~100x faster execution.

## Common Commands

```bash
# Build the library
npm run build

# Run all tests
npm run test

# Run tests in watch mode (also generates graphql-codegen comparison output)
npm run test:watch

# Run a single test case
npm run test -- -t "handles case \"aliases\""

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run prettier
npm run prettier:fix

# Run benchmark
npm run benchmark
```

## Architecture

### Core Classes (src/classes/)

- **Generator**: Main entry point. Accepts a GraphQL schema and documents, tracks dependencies between fragments/operations, and outputs TypeScript types. Key methods:
  - `add(docs)`: Add new documents
  - `update(docs)`: Update existing documents (triggers incremental rebuild)
  - `build()`: Generate output
  - `generateOnce()`: Static method for one-shot generation

- **SchemaProvider**: Wrapper around GraphQL schema providing helper methods for type lookups and interface/union resolution

- **DependencyTracker**: Tracks dependencies between input files and generated code, enabling incremental updates

- **GeneratorOutput/GeneratorOutputFile/GeneratorOutputCode**: Output representation classes for generated TypeScript

### Code Generation Flow

1. Documents are parsed and added via `generator.add()`
2. On `build()`:
   - Fragment definitions are collected
   - For each operation, an IR (Intermediate Representation) is built from selection sets
   - IR nodes represent: OBJECT, SCALAR, ARRAY, UNION, INTERSECTION, TYPENAME, FRAGMENT_SPREAD
   - IR is converted to TypeScript code strings
   - Fragment types are generated and referenced by operations
3. Output can be retrieved as `.ts`, `.d.ts`, or `.js` files

### Intermediate Representation (src/helpers/ir.ts)

The IR system transforms GraphQL AST into a simpler structure for TypeScript generation:
- Handles field merging when fragments select overlapping fields
- Detects conflicts between fragment spreads and uses `Omit<>` when necessary
- Manages `__typename` output with `Exclude<>` for union/interface types

## Test Structure

Tests use Vitest with file-based snapshots:

```
__tests__/unit/Generator/cases/
  <case-name>/
    test.graphql      # Input GraphQL document
    result.ts         # Expected TypeScript output (snapshot)
    schema.graphql    # Optional custom schema (uses default if not present)
    runtime.ts        # Optional runtime type tests
```

The test runner generates output with both caching enabled and disabled, verifying they produce identical results.

Default test schema is at `__tests__/unit/Generator/schema.graphql`.

## Key Design Decisions

- Fragment types are always generated and reused in operations via intersection (`&`)
- When field conflicts occur between fragments, `Omit<FragmentType, 'conflictField'>` is used
- `__typename` fields use `Exclude<UnionType, SpecificType>` to reduce type size
- Enums generate both a `const` object and a type union (not TypeScript `enum`)
- Nullable fields default to optional (`field?: T`) but can be configured for `| null` or `Maybe<T>`
