// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * enum Priority {
 *   LOW
 *   MEDIUM
 *   HIGH
 *   CRITICAL
 * }
 * ```
 */
export const Priority = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const);
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * @example
 * ```graphql
 * enum Status {
 *   DRAFT
 *   PUBLISHED
 *   ARCHIVED
 * }
 * ```
 */
export const Status = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const);
export type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Article = 'Article';
type CodeBlock = 'CodeBlock';
type Document = 'Document';
type Image = 'Image';
type ImageGallery = 'ImageGallery';
type Page = 'Page';
type TextBlock = 'TextBlock';
type Video = 'Video';
type VideoEmbed = 'VideoEmbed';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Content = Article | Page;

export type MediaItem = Document | Image | Video;

export type SectionContent = CodeBlock | ImageGallery | TextBlock | VideoEmbed;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleBasic on Article {
 *   __typename
 *   id
 *   title
 *   status
 *   excerpt
 * }
 * ```
 */
export type ArticleBasicFragment = {
  __typename: Article;
  excerpt?: string;
  id: string | number;
  status: Status;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleDetails on Article {
 *   body
 *   tags
 *   priority
 *   author {
 *     ...personFull
 *   }
 *   category {
 *     label
 *     metadata {
 *       key
 *       value
 *     }
 *   }
 * }
 * ```
 */
export type ArticleDetailsFragment = {
  author: PersonFullFragment;
  body?: string;
  category?: {
    label: string;
    metadata?: {
      key: string;
      value?: string;
    };
  };
  priority?: Priority;
  tags?: string[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleMedia on Article {
 *   media {
 *     __typename
 *     ...mediaUnionFields
 *   }
 * }
 * ```
 */
export type ArticleMediaFragment = {
media?: (((ImageFieldsFragment & { __typename: Image }) | (VideoFieldsFragment & { __typename: Video }) | {
  __typename: Document;
  filename: string;
  url: string;
}))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment contentFields on Content {
 *   title
 *   status
 * }
 * ```
 */
export type ContentFieldsFragment = {
  status: Status;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment identifiableFields on Identifiable {
 *   id
 *   uuid
 * }
 * ```
 */
export type IdentifiableFieldsFragment = {
  id: string | number;
  uuid: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment imageFields on Image {
 *   id
 *   url
 *   alt
 *   width
 *   height
 *   caption
 * }
 * ```
 */
export type ImageFieldsFragment = {
  alt?: string;
  caption?: string;
  height?: number;
  id: string | number;
  url: string;
  width?: number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mediaUnionFields on MediaItem {
 *   ... on Image {
 *     ...imageFields
 *   }
 *   ... on Video {
 *     ...videoFields
 *   }
 *   ... on Document {
 *     url
 *     filename
 *   }
 * }
 * ```
 */
export type MediaUnionFieldsFragment = (ImageFieldsFragment | VideoFieldsFragment | {
  filename: string;
  url: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageWithSections on Page {
 *   body
 *   sections {
 *     ...sectionDeep
 *   }
 *   children {
 *     title
 *     sections {
 *       id
 *       heading
 *     }
 *   }
 * }
 * ```
 */
export type PageWithSectionsFragment = {
  body?: string;
  children?: ({
    sections?: ({
      heading?: string;
      id: string | number;
    })[];
    title: string;
  })[];
  sections?: SectionDeepFragment[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment personBasic on Person {
 *   id
 *   name
 * }
 * ```
 */
export type PersonBasicFragment = {
  id: string | number;
  name: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment personFull on Person {
 *   ...personBasic
 *   email
 *   avatar {
 *     url
 *     alt
 *   }
 * }
 * ```
 */
export type PersonFullFragment = {
  avatar?: {
    alt?: string;
    url: string;
  };
  email?: string;
} & PersonBasicFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment sectionDeep on Section {
 *   id
 *   heading
 *   content {
 *     __typename
 *     ... on TextBlock {
 *       html
 *       plain
 *     }
 *     ... on ImageGallery {
 *       layout
 *       images {
 *         ...imageFields
 *       }
 *     }
 *     ... on VideoEmbed {
 *       autoplay
 *       video {
 *         ...videoFields
 *       }
 *     }
 *     ... on CodeBlock {
 *       code
 *       language
 *     }
 *   }
 *   subsections {
 *     id
 *     heading
 *     content {
 *       __typename
 *       ... on TextBlock {
 *         html
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type SectionDeepFragment = {
  content?: ({
    __typename: CodeBlock;
    code: string;
    language?: string;
  } | {
    __typename: ImageGallery;
    images: ImageFieldsFragment[];
    layout?: string;
  } | {
    __typename: TextBlock;
    html: string;
    plain?: string;
  } | {
    __typename: VideoEmbed;
    autoplay?: boolean;
    video: VideoFieldsFragment;
  });
  heading?: string;
  id: string | number;
  subsections?: ({
    content?: ({
      __typename: Exclude<SectionContent, TextBlock>;
    } | {
      __typename: TextBlock;
      html: string;
    });
    heading?: string;
    id: string | number;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment treeNodeRecursive on TreeNode {
 *   id
 *   label
 *   metadata {
 *     key
 *     value
 *     nested {
 *       key
 *       value
 *     }
 *     tags
 *   }
 *   children {
 *     id
 *     label
 *     children {
 *       id
 *       label
 *       children {
 *         id
 *         label
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type TreeNodeRecursiveFragment = {
  children: ({
    children: ({
      children: ({
        id: string | number;
        label: string;
      })[];
      id: string | number;
      label: string;
    })[];
    id: string | number;
    label: string;
  })[];
  id: string | number;
  label: string;
  metadata?: {
    key: string;
    nested?: {
      key: string;
      value?: string;
    }[];
    tags?: (string[] | null)[];
    value?: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment videoFields on Video {
 *   id
 *   url
 *   duration
 *   provider
 * }
 * ```
 */
export type VideoFieldsFragment = {
  duration?: number;
  id: string | number;
  provider?: string;
  url: string;
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query ComplexEdgeCases(
 *   $id: ID!
 *   $filter: ContentFilter
 *   $includeMedia: Boolean! = true
 *   $skipContributors: Boolean! = false
 *   $limit: Int = 20
 * ) {
 *   content(id: $id) {
 *     __typename
 *     ...identifiableFields
 *     ...contentFields
 * 
 *     ... on Timestamped {
 *       createdAt
 *       updatedAt
 *     }
 * 
 *     ... on Article {
 *       ...articleDetails
 *       ...articleMedia @include(if: $includeMedia)
 *       contributors @skip(if: $skipContributors) {
 *         ...personBasic
 *       }
 *     }
 * 
 *     ... on Page {
 *       ...pageWithSections
 *       parent {
 *         __typename
 *         title
 *         parent {
 *           title
 *         }
 *       }
 *     }
 *   }
 * 
 *   media(id: $id) {
 *     __typename
 *     ... on Image {
 *       ...imageFields
 *     }
 *     ... on Video {
 *       ...videoFields
 *       thumbnail {
 *         ...imageFields
 *       }
 *     }
 *     ... on Document {
 *       url
 *       filename
 *       mimeType
 *       size
 *     }
 *   }
 * 
 *   tree(rootId: $id) {
 *     ...treeNodeRecursive
 *   }
 * 
 *   search(query: "test", filter: $filter) {
 *     total
 *     items {
 *       __typename
 *       ...contentFields
 *       ... on Article {
 *         excerpt
 *         priority
 *         category {
 *           label
 *           parent {
 *             label
 *           }
 *         }
 *       }
 *       ... on Page {
 *         sections {
 *           ...sectionDeep
 *         }
 *       }
 *     }
 *     facets {
 *       statuses {
 *         value
 *         count
 *       }
 *       authors {
 *         value
 *         count
 *       }
 *     }
 *   }
 * 
 *   article(id: $id) {
 *     ...articleBasic
 *     ...articleDetails
 *     ...articleMedia @include(if: $includeMedia)
 *     title
 *     author {
 *       name
 *       ...personBasic
 *     }
 *   }
 * 
 *   allContent(filter: $filter, limit: $limit) {
 *     __typename
 *     ... on Article {
 *       relatedContent {
 *         __typename
 *         title
 *         ... on Article {
 *           author {
 *             avatar {
 *               ...imageFields
 *             }
 *           }
 *           media {
 *             __typename
 *             ... on Image {
 *               ...imageFields
 *             }
 *             ... on Video {
 *               thumbnail {
 *                 url
 *                 alt
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type ComplexEdgeCasesQuery = {
  allContent: (({
    __typename: Article;
    relatedContent?: (({
      __typename: Article;
      author: {
        avatar?: ImageFieldsFragment;
      };
    media?: (((ImageFieldsFragment & { __typename: Image }) | {
      __typename: Document;
    } | {
      __typename: Video;
      thumbnail?: {
        alt?: string;
        url: string;
      };
    }))[];
    title: string;
  } | {
    __typename: Page;
    title: string;
  }))[];
} | {
  __typename: Page;
}))[];
article?: ({
  author: {
    name: string;
  } & PersonBasicFragment & PersonFullFragment;
} & {
  __typename: Article;
  title: string;
} & ArticleBasicFragment & Omit<ArticleDetailsFragment, "author"> & ArticleMediaFragment);
content?: ({
  __typename: Article;
  contributors?: PersonBasicFragment[];
  createdAt: number;
  id: string | number;
  status: Status;
  title: string;
  updatedAt?: number;
  uuid: string;
} & ArticleDetailsFragment & ArticleMediaFragment | {
  __typename: Page;
  createdAt: number;
  id: string | number;
  parent?: {
    __typename: Page;
    parent?: {
      title: string;
    };
    title: string;
  };
  status: Status;
  title: string;
  updatedAt?: number;
  uuid: string;
} & PageWithSectionsFragment);
media?: ((ImageFieldsFragment & { __typename: Image }) | {
  __typename: Document;
  filename: string;
  mimeType: string;
  size?: number;
  url: string;
} | {
  __typename: Video;
  thumbnail?: ImageFieldsFragment;
} & VideoFieldsFragment);
search: {
  facets?: {
    authors: {
      count: number;
      value: string;
    }[];
    statuses: {
      count: number;
      value: string;
    }[];
  };
  items: (({
    __typename: Article;
    category?: {
      label: string;
      parent?: {
        label: string;
      };
    };
    excerpt?: string;
    priority?: Priority;
    status: Status;
    title: string;
  } | {
    __typename: Page;
    sections?: SectionDeepFragment[];
    status: Status;
    title: string;
  }))[];
  total: number;
};
tree?: TreeNodeRecursiveFragment;
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type ComplexEdgeCasesQueryVariables = Exact<{
  filter?: ContentFilter | null;
  id: string | number;
  includeMedia: boolean;
  limit?: number | null;
  skipContributors: boolean;
}>;


// --------------------------------------------------------------------------------
// Input Types
// --------------------------------------------------------------------------------

/**
 * @example
 * ```graphql
 * input AuthorFilter {
 *   ids: [ID!]
 *   nameContains: String
 * }
 * ```
 */
export type AuthorFilter = {
  ids?: (string | number)[] | null;
  nameContains?: string | null;
};

/**
 * @example
 * ```graphql
 * input ContentFilter {
 *   status: [Status!]
 *   priority: Priority
 *   author: AuthorFilter
 *   dateRange: DateRange
 *   tags: TagFilter
 * }
 * ```
 */
export type ContentFilter = {
  author?: AuthorFilter | null;
  dateRange?: DateRange | null;
  priority?: Priority | null;
  status?: Status[] | null;
  tags?: TagFilter | null;
};

/**
 * @example
 * ```graphql
 * input DateRange {
 *   from: Int
 *   to: Int
 * }
 * ```
 */
export type DateRange = {
  from?: number | null;
  to?: number | null;
};

/**
 * @example
 * ```graphql
 * input TagFilter {
 *   include: [String!]
 *   exclude: [String!]
 *   matchAll: Boolean = false
 * }
 * ```
 */
export type TagFilter = {
  exclude?: string[] | null;
  include?: string[] | null;
  matchAll?: boolean | null;
};