# graphql-typescript-codegen-fast

This is an **experimental** and **opiniated** code generator for generating
TypeScript types for GraphQL operations and fragments.

## Features

- Readability: The generated types are easy to read and understand.
- Incremental: Update only types for files that changed.

## Usage

### Basic

To just generate types use the static `generateOnce` method:

```typescript
import { Generator } from 'graphql-typescript-generator'
import { parse } from 'graphql'

const SCHEMA = `
type Query {
  ping: Boolean!
}
`

const DOC = `
query myQuery {
  ping
}
`

// Contains the compiled TS types as a string.
const result = await Generator.generate(SCHEMA, DOC)
```

### Stateful

More interesting, especially in a local dev enviroment, is the stateful usage:

```typescript
import { Generator } from 'graphql-typescript-generator'
import { parse } from 'graphql'
import { loadSchema } from '@graphql-tools/load'

const SCHEMA = `
type Image {
  url: String!
  alt: String
}

type Query {
  getRandomImage: Image!
  ping: Boolean!
}
`

const DOC = `
query myQuery {
  getRandomImage {
    ...image
  }
}`

const FRAGMENT = `
fragment myImage on Image {
  url
}`

const schema = await loadSchema(SCHEMA, { loaders: [] })
const generator = new Generator(schema)

// Add the documents.
generator.add([
  {
    documentNode: parse(DOC),
    filePath: './somewhere/in/repo/myQuery.graphql',
  },
  {
    documentNode: parse(FRAGMENT),
    filePath: './somewhere/in/repo/fragment.image.graphql',
  },
])

console.log(generator.build().getAll())

// Add a new one.
generator.add({
  documentNode: parse('query myNewQuery { ping }'),
  filePath: './somewhere/in/repo/myNewQuery.graphql',
})

// Will only generate code for the new query and reuse existing code.
console.log(generator.build().getAll())

// Update a previously added document.
generator.update({
  documentNode: parse('fragment myImage on Image { url, alt }'),
  filePath: './somewhere/in/repo/fragment.image.graphql',
})

// Will update both the fragment type *and* the existing query type (since it depends on it).
console.log(generator.build().getAll())
```

## Why?

Mostly performance: On some of my projects with large schemas and tons of
operations, running graphql-codegen takes up to 10s, other team members with
less powerful machines report even higher numbers, sometimes up to one minute.

In addition, I was never truly happy with the output, no matter what options I
tried. The output also tends to be extremely verbose and large, affecting
language server performance.

## Performance

To test the performance I've used a quite large project (~ 15k lines of schema,
with 135 fragments and 173 operations) as reference. On average, this generator
only takes around **50ms** to produce the string with all TypeScript code.
Compared to graphql-codegen, which averages around **6000ms** for me.

## Output

The output is very opiniated and I don't plan to add options to customise it in
significant ways. Some things can be customised, such as adding TypeDoc comments
or altering how types or enums are named.

### Fragment Types

A type is generated for every fragment and this type is also used whenever
possible.

```graphql
query fragmentInterface {
  getRandomEntity {
    ...entity
  }
}

fragment entity on Entity {
  id
}
```

```typescript
export type FragmentInterfaceQuery = {
  getRandomEntity: EntityFragment | null
}

export type EntityFragment = {
  id: string
}
```

### Inlined Fragment Fields

Sometimes it's not possible to use fragment types in an intersection:

```graphql
query fieldMergingNested {
  entityById(id: "1", entityType: NODE) {
    ...nodeArticleOne
    ...nodeArticleTwo
  }
}

fragment nodeArticleOne on NodeArticle {
  title
  categories {
    label
  }
}

fragment nodeArticleTwo on NodeArticle {
  tags
  categories {
    url
  }
}
```

Here both fragments define a nested array field (categories), but pick different
fields inside this array.

If we were to intersect both types:

```typescript
type NodeArticleOneFragment = {
  title: string
  categories: Array<{
    label: string
  }> | null
}

type NodeArticleTwoFragment = {
  tags: Array<string | null> | null
  categories: Array<{
    url: string | null
  }> | null
}

type Intersected = NodeArticleOneFragment & NodeArticleTwoFragment
```

Then the type of `categories` would be:

```typescript
const categories:
  | ({
      label: string
    }[] &
      {
        url: string | null
      }[])
  | null
```

So, either an array of `{ label: string }` _or_ an array of `{ url: string }`.

In such a case where properties that would result in an invalid intersection are
inlined, while still referencing the fragment type by omitting the inlined
properties:

```typescript
export type FieldMergingNestedQuery = {
  entityById:
    | object
    | ((Omit<NodeArticleOneFragment, 'categories'> &
        Omit<NodeArticleTwoFragment, 'categories'>) & {
        categories: Array<{
          label: string
          url: string | null
        }> | null
      })
    | null
}
```

The final resolved type in the IDE will be:

```typescript
const entityById:
  | object
  | {
      title: string
      tags: Array<string | null> | null
      categories: Array<{
        label: string
        url: string | null
      }> | null
    }
```

### `__typename`

By default a string literal type is generated for every type and an additional
union of these for every GraphQL interface or union type.

```graphqls
interface Entity {
  id: String!
}

interface Node implements Entity {
  id: String!
  title: String!
}

type NodePage implements Entity & Node {
  id: String!
  title: String!
  body: String
}

type NodeArticle implements Entity & Node {
  id: String!
  title: String!
  date: String!
  body: String!
}

type Image implements Entity {
  id: String!
  title: String!
  imageUrl: String!
}

type Document implements Entity {
  id: String!
  title: String!
  videoUrl: String!
}

union SearchResult = NodeArticle | Document
```

This will generate the following:

```typescript
// Types
type NodePage = 'NodePage'
type NodeArticle = 'NodeArticle'
type Image = 'Image'
type Document = 'Document'

// Interfaces
export type Entity = NodePage | NodeArticle | Image | Document
export type Node = NodePage | NodeArticle

// Unions
export type SearchResult = NodeArticle | Document
```

When using this query for example:

```graphql
query getRandomEntity {
  getRandomEntity {
    __typename
    ... on NodePage {
      body
    }
  }
}
```

These types are referenced for every `__typename` field:

```typescript
export type GetRandomEntity = {
  getRandomEntity:
    | { __typename: Exclude<Entity, NodePage> }
    | { __typename: NodePage; body: string | null }
    | null
}
```

This prevents generating identical object shapes where only the `__typename`
changes, which can very quickly bloat the TypeScript code, making it difficult
to make sense of the types:

```typescript
export type GetRandomEntity = {
  getRandomEntity:
    | { __typename: 'Document' }
    | { __typename: 'Image' }
    | { __typename: 'NodeArticle' }
    | { __typename: 'User' }
    | { __typename: 'Comment' }
    | { __typename: 'NodePage'; body: string | null }
    | null
}
```

### Enums

By default, enums are exported as a `const` (vs. a TypeScript `enum`) and
exported as a string literal union type with the same name.

```graphqls
enum ContactMethod {
  PHONE
  MAIL
}
```

```typescript
export const ContactMethod = {
  /* Contact via phone. */
  PHONE: 'PHONE',
  /* Contact via email. */
  MAIL: 'MAIL',
} as const
export type ContactMethod = (typeof ContactMethod)[keyof typeof ContactMethod]
```

## Options

Check out [all options](./src/types/options.ts).