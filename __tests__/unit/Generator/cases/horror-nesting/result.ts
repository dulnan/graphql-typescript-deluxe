// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Article = 'Article';
type AudioClip = 'AudioClip';
type Category = 'Category';
type Document = 'Document';
type EmbedBlock = 'EmbedBlock';
type Image = 'Image';
type MediaBlock = 'MediaBlock';
type NestedBlock = 'NestedBlock';
type Page = 'Page';
type Person = 'Person';
type Product = 'Product';
type TextBlock = 'TextBlock';
type Video = 'Video';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type BlockContent = EmbedBlock | MediaBlock | NestedBlock | TextBlock;

export type Content = Article | Page;

export type Linkable = Article | Category | Page | Product;

export type MediaItem = AudioClip | Document | Image | Video;

export type SearchResult = Article | Page | Person | Product;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleFields on Article {
 *   body
 *   excerpt
 *   publishedAt
 *   author {
 *     ...personBasic
 *   }
 * }
 * ```
 */
export type ArticleFieldsFragment = {
  author?: PersonBasicFragment;
  body?: string;
  excerpt?: string;
  publishedAt?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleShallow on Article {
 *   id
 *   title
 *   slug
 *   excerpt
 * }
 * ```
 */
export type ArticleShallowFragment = {
  excerpt?: string;
  id: string | number;
  slug: string;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment blockFields on BlockContent {
 *   ... on TextBlock {
 *     id
 *     html
 *   }
 *   ... on MediaBlock {
 *     id
 *     caption
 *   }
 *   ... on EmbedBlock {
 *     id
 *     embedUrl
 *   }
 *   ... on NestedBlock {
 *     id
 *     title
 *   }
 * }
 * ```
 */
export type BlockFieldsFragment = ({
  caption?: string;
  id: string | number;
} | {
  embedUrl: string;
  id: string | number;
} | {
  html: string;
  id: string | number;
} | {
  id: string | number;
  title?: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment categoryDeep on Category {
 *   id
 *   name
 *   slug
 *   parent {
 *     id
 *     name
 *     parent {
 *       id
 *       name
 *     }
 *   }
 *   children {
 *     id
 *     name
 *     children {
 *       id
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type CategoryDeepFragment = {
  children?: ({
    children?: ({
      id: string | number;
      name: string;
    })[];
    id: string | number;
    name: string;
  })[];
  id: string | number;
  name: string;
  parent?: {
    id: string | number;
    name: string;
    parent?: {
      id: string | number;
      name: string;
    };
  };
  slug: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment contentBaseFields on Content {
 *   id
 *   uuid
 *   title
 *   tags
 * }
 * ```
 */
export type ContentBaseFieldsFragment = {
  id: string | number;
  tags?: string[];
  title: string;
  uuid: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment displayableFields on Displayable {
 *   title
 *   description
 * }
 * ```
 */
export type DisplayableFieldsFragment = {
  description?: string;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment documentFields on Document {
 *   id
 *   url
 *   filename
 *   mimeType
 *   size
 * }
 * ```
 */
export type DocumentFieldsFragment = {
  filename: string;
  id: string | number;
  mimeType: string;
  size?: number;
  url: string;
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
 * fragment linkableFields on Linkable {
 *   url
 *   slug
 * }
 * ```
 */
export type LinkableFieldsFragment = {
  slug: string;
  url: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mediaItemFields on MediaItem {
 *   ... on Image {
 *     id
 *     url
 *     alt
 *   }
 *   ... on Video {
 *     id
 *     url
 *     duration
 *   }
 *   ... on Document {
 *     id
 *     url
 *     filename
 *   }
 *   ... on AudioClip {
 *     id
 *     url
 *   }
 * }
 * ```
 */
export type MediaItemFieldsFragment = ({
  alt?: string;
  id: string | number;
  url: string;
} | {
  duration?: number;
  id: string | number;
  url: string;
} | {
  filename: string;
  id: string | number;
  url: string;
} | {
  id: string | number;
  url: string;
});

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeFields on Node {
 *   id
 *   uuid
 * }
 * ```
 */
export type NodeFieldsFragment = {
  id: string | number;
  uuid: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageFields on Page {
 *   body
 *   author {
 *     ...personBasic
 *   }
 * }
 * ```
 */
export type PageFieldsFragment = {
  author?: PersonBasicFragment;
  body?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageShallow on Page {
 *   id
 *   title
 *   url
 *   slug
 * }
 * ```
 */
export type PageShallowFragment = {
  id: string | number;
  slug: string;
  title: string;
  url: string;
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
 *   role
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
  role?: string;
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
 *     ...blockFields
 *     ... on MediaBlock {
 *       media {
 *         __typename
 *         ... on Image {
 *           ...imageFields
 *         }
 *         ... on Video {
 *           thumbnail {
 *             url
 *           }
 *         }
 *       }
 *     }
 *     ... on NestedBlock {
 *       blocks {
 *         __typename
 *         ... on TextBlock {
 *           html
 *           plain
 *         }
 *       }
 *     }
 *   }
 *   relatedMedia {
 *     __typename
 *     ...mediaItemFields
 *   }
 * }
 * ```
 */
export type SectionDeepFragment = {
  content?: ({
    __typename: EmbedBlock;
    embedUrl: string;
    id: string | number;
  } | {
    __typename: MediaBlock;
    caption?: string;
    id: string | number;
  media: ((ImageFieldsFragment & { __typename: Image }) | {
    __typename: AudioClip | Document;
  } | {
    __typename: Video;
    thumbnail?: {
      url: string;
    };
  });
} | {
  __typename: NestedBlock;
  blocks: (({
    __typename: Exclude<BlockContent, TextBlock>;
  } | {
    __typename: TextBlock;
    html: string;
    plain?: string;
  }))[];
  id: string | number;
  title?: string;
} | {
  __typename: TextBlock;
  html: string;
  id: string | number;
});
heading?: string;
id: string | number;
relatedMedia?: (({
  __typename: AudioClip;
  id: string | number;
  url: string;
} | {
  __typename: Document;
  filename: string;
  id: string | number;
  url: string;
} | {
  __typename: Image;
  alt?: string;
  id: string | number;
  url: string;
} | {
  __typename: Video;
  duration?: number;
  id: string | number;
  url: string;
}))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment sectionShallow on Section {
 *   id
 *   heading
 * }
 * ```
 */
export type SectionShallowFragment = {
  heading?: string;
  id: string | number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment variantFields on ProductVariant {
 *   id
 *   name
 *   sku
 *   price
 * }
 * ```
 */
export type VariantFieldsFragment = {
  id: string | number;
  name: string;
  price: number;
  sku: string;
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
 *   transcript
 * }
 * ```
 */
export type VideoFieldsFragment = {
  duration?: number;
  id: string | number;
  transcript?: string;
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
 * query HorrorNesting($id: ID!, $query: String!) {
 *   # Level 1: Interface with multiple implementing types
 *   # Using fragments + inline spreads + overlapping selections
 *   content(id: $id) {
 *     __typename
 *     ...nodeFields
 *     ...displayableFields
 *     ...contentBaseFields
 * 
 *     # Inline spread on same interface (Content) - overlaps with fragment
 *     ... on Content {
 *       title
 *       description
 *       author {
 *         ...personBasic
 *         ... on Person {
 *           email
 *         }
 *       }
 *     }
 * 
 *     # Inline spreads on concrete types with nested complexity
 *     ... on Article {
 *       ...articleFields
 *       body
 *       excerpt
 * 
 *       # Nested: featuredMedia is a union
 *       featuredMedia {
 *         __typename
 *         ...mediaItemFields
 *         ... on Image {
 *           photographer {
 *             ...personBasic
 *             articles {
 *               ...articleShallow
 *             }
 *           }
 *         }
 *         ... on Video {
 *           director {
 *             name
 *             ...personBasic
 *           }
 *           thumbnail {
 *             ...imageFields
 *           }
 *         }
 *       }
 * 
 *       # Nested: blocks is a union array with recursive NestedBlock
 *       blocks {
 *         __typename
 *         ...blockFields
 *         ... on MediaBlock {
 *           media {
 *             __typename
 *             ... on Image {
 *               ...imageFields
 *               photographer {
 *                 name
 *               }
 *             }
 *             ... on Video {
 *               ...videoFields
 *             }
 *           }
 *         }
 *         ... on NestedBlock {
 *           blocks {
 *             __typename
 *             ... on TextBlock {
 *               html
 *             }
 *             ... on MediaBlock {
 *               media {
 *                 __typename
 *                 ...mediaItemFields
 *               }
 *             }
 *             ... on NestedBlock {
 *               title
 *               blocks {
 *                 __typename
 *                 ... on TextBlock {
 *                   plain
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 * 
 *       # Nested: relatedContent is the same interface (Content) - recursive
 *       relatedContent {
 *         __typename
 *         ...contentBaseFields
 *         ... on Article {
 *           excerpt
 *           author {
 *             name
 *           }
 *         }
 *         ... on Page {
 *           sections {
 *             ...sectionShallow
 *           }
 *         }
 *       }
 *     }
 * 
 *     ... on Page {
 *       ...pageFields
 *       body
 * 
 *       # Nested: sections with recursive subsections
 *       sections {
 *         ...sectionDeep
 *         subsections {
 *           ...sectionDeep
 *           subsections {
 *             id
 *             heading
 *             content {
 *               __typename
 *               ... on TextBlock {
 *                 html
 *               }
 *             }
 *           }
 *         }
 *       }
 * 
 *       # Nested: parent/children is recursive Page
 *       parent {
 *         ...pageShallow
 *         parent {
 *           title
 *           url
 *         }
 *       }
 * 
 *       children {
 *         ...pageShallow
 *         children {
 *           title
 *           sections {
 *             id
 *           }
 *         }
 *       }
 * 
 *       # Nested: navigation is Linkable interface
 *       navigation {
 *         __typename
 *         ...linkableFields
 *         ... on Article {
 *           excerpt
 *         }
 *         ... on Page {
 *           body
 *         }
 *         ... on Product {
 *           price
 *         }
 *         ... on Category {
 *           name
 *         }
 *       }
 *     }
 *   }
 * 
 *   # Level 1: Union type with exhaustive handling
 *   media(id: $id) {
 *     __typename
 *     ...mediaItemFields
 * 
 *     ... on Image {
 *       ...imageFields
 *       photographer {
 *         ...personFull
 *       }
 *     }
 * 
 *     ... on Video {
 *       ...videoFields
 *       thumbnail {
 *         ...imageFields
 *         photographer {
 *           name
 *         }
 *       }
 *       director {
 *         ...personFull
 *         articles {
 *           title
 *           featuredMedia {
 *             __typename
 *             ... on Image {
 *               url
 *             }
 *           }
 *         }
 *       }
 *     }
 * 
 *     ... on Document {
 *       ...documentFields
 *       uploadedBy {
 *         ...personBasic
 *       }
 *     }
 * 
 *     ... on AudioClip {
 *       duration
 *       artist {
 *         ...personBasic
 *         articles {
 *           ...articleShallow
 *         }
 *       }
 *     }
 *   }
 * 
 *   # Search returns union array with complex nested selections
 *   search(query: $query) {
 *     __typename
 * 
 *     # Inline on interface that some union members implement
 *     ... on Node {
 *       id
 *       uuid
 *     }
 * 
 *     ... on Displayable {
 *       title
 *       description
 *     }
 * 
 *     ... on Linkable {
 *       url
 *       slug
 *     }
 * 
 *     # Concrete type handling with deep nesting
 *     ... on Article {
 *       ...articleFields
 *       relatedContent {
 *         __typename
 *         ... on Article {
 *           ...articleShallow
 *           blocks {
 *             __typename
 *             ... on NestedBlock {
 *               blocks {
 *                 __typename
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 * 
 *     ... on Page {
 *       ...pageFields
 *       sections {
 *         ...sectionDeep
 *       }
 *     }
 * 
 *     ... on Product {
 *       price
 *       media {
 *         __typename
 *         ...mediaItemFields
 *       }
 *       variants {
 *         ...variantFields
 *         image {
 *           ...imageFields
 *         }
 *       }
 *       relatedProducts {
 *         title
 *         price
 *         media {
 *           __typename
 *           ... on Image {
 *             url
 *             alt
 *           }
 *         }
 *       }
 *       category {
 *         ...categoryDeep
 *       }
 *     }
 * 
 *     ... on Person {
 *       ...personFull
 *       articles {
 *         ...articleShallow
 *         category {
 *           name
 *         }
 *       }
 *       managedProducts {
 *         title
 *         price
 *       }
 *     }
 *   }
 * 
 *   # Another content query with different fragment combination
 *   article(id: $id) {
 *     # Same type, different fragments - should merge
 *     ...articleFields
 *     ...articleShallow
 *     ...contentBaseFields
 * 
 *     # Overlapping inline selection
 *     title
 *     body
 * 
 *     # Different nested selection than above
 *     author {
 *       ...personFull
 *       avatar {
 *         ...imageFields
 *       }
 *     }
 * 
 *     # Category with recursive parent
 *     category {
 *       ...categoryDeep
 *     }
 *   }
 * 
 *   # Linkable interface - implements by multiple types
 *   linkable(slug: "test") {
 *     __typename
 *     ...linkableFields
 * 
 *     ... on Article {
 *       ...articleFields
 *       author {
 *         name
 *       }
 *     }
 * 
 *     ... on Page {
 *       body
 *       parent {
 *         title
 *       }
 *     }
 * 
 *     ... on Product {
 *       price
 *       variants {
 *         name
 *         sku
 *       }
 *     }
 * 
 *     ... on Category {
 *       name
 *       parent {
 *         name
 *       }
 *       children {
 *         name
 *       }
 *     }
 *   }
 * 
 *   # All content with different selection per type
 *   allContent {
 *     __typename
 *     ...contentBaseFields
 * 
 *     ... on Article {
 *       excerpt
 *       blocks {
 *         __typename
 *         ... on TextBlock {
 *           html
 *         }
 *         ... on MediaBlock {
 *           caption
 *         }
 *       }
 *     }
 * 
 *     ... on Page {
 *       body
 *       sections {
 *         id
 *         heading
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type HorrorNestingQuery = {
  allContent: (({
    __typename: Article;
    blocks?: (({
      __typename: EmbedBlock | NestedBlock;
    } | {
      __typename: MediaBlock;
      caption?: string;
    } | {
      __typename: TextBlock;
      html: string;
    }))[];
    excerpt?: string;
    id: string | number;
    tags?: string[];
    title: string;
    uuid: string;
  } | {
    __typename: Page;
    body?: string;
    id: string | number;
    sections?: ({
      heading?: string;
      id: string | number;
    })[];
    tags?: string[];
    title: string;
    uuid: string;
  }))[];
  article?: ({
    author?: ({
      avatar?: {
        alt?: string;
        url: string;
      } & ImageFieldsFragment;
    } & Omit<PersonFullFragment, "avatar"> & PersonBasicFragment);
  } & {
    body?: string;
    category?: CategoryDeepFragment;
    title: string;
  } & Omit<ArticleFieldsFragment, "author"> & ArticleShallowFragment & ContentBaseFieldsFragment);
  content?: ({
    __typename: Article;
    author?: {
      email?: string;
    } & PersonBasicFragment;
    blocks?: (({
      __typename: EmbedBlock;
      embedUrl: string;
      id: string | number;
    } | {
      __typename: MediaBlock;
      caption?: string;
      id: string | number;
    media: ((VideoFieldsFragment & { __typename: Video }) | {
      __typename: AudioClip | Document;
    } | {
      __typename: Image;
      photographer?: {
        name: string;
      };
    } & ImageFieldsFragment);
  } | {
    __typename: NestedBlock;
    blocks: (({
      __typename: EmbedBlock;
    } | {
      __typename: MediaBlock;
      media: ({
        __typename: AudioClip;
        id: string | number;
        url: string;
      } | {
        __typename: Document;
        filename: string;
        id: string | number;
        url: string;
      } | {
        __typename: Image;
        alt?: string;
        id: string | number;
        url: string;
      } | {
        __typename: Video;
        duration?: number;
        id: string | number;
        url: string;
      });
    } | {
      __typename: NestedBlock;
      blocks: (({
        __typename: Exclude<BlockContent, TextBlock>;
      } | {
        __typename: TextBlock;
        plain?: string;
      }))[];
      title?: string;
    } | {
      __typename: TextBlock;
      html: string;
    }))[];
    id: string | number;
    title?: string;
  } | {
    __typename: TextBlock;
    html: string;
    id: string | number;
  }))[];
  body?: string;
  description?: string;
  excerpt?: string;
  featuredMedia?: ({
    __typename: AudioClip;
    id: string | number;
    url: string;
  } | {
    __typename: Document;
    filename: string;
    id: string | number;
    url: string;
  } | {
    __typename: Image;
    alt?: string;
    id: string | number;
    photographer?: {
      articles?: ArticleShallowFragment[];
    } & PersonBasicFragment;
    url: string;
  } | {
    __typename: Video;
    director?: {
      name: string;
    } & PersonBasicFragment;
    duration?: number;
    id: string | number;
    thumbnail?: ImageFieldsFragment;
    url: string;
  });
  id: string | number;
  relatedContent?: (({
    __typename: Article;
    author?: {
      name: string;
    };
    excerpt?: string;
    id: string | number;
    tags?: string[];
    title: string;
    uuid: string;
  } | {
    __typename: Page;
    id: string | number;
    sections?: SectionShallowFragment[];
    tags?: string[];
    title: string;
    uuid: string;
  }))[];
  tags?: string[];
  title: string;
  uuid: string;
} & ArticleFieldsFragment | {
  __typename: Page;
  author?: {
    email?: string;
  } & PersonBasicFragment;
  body?: string;
  children?: ({
    children?: ({
      sections?: ({
        id: string | number;
      })[];
      title: string;
    })[];
  } & PageShallowFragment)[];
  description?: string;
  id: string | number;
  navigation?: (({
    __typename: Article;
    excerpt?: string;
    slug: string;
    url: string;
  } | {
    __typename: Category;
    name: string;
    slug: string;
    url: string;
  } | {
    __typename: Page;
    body?: string;
    slug: string;
    url: string;
  } | {
    __typename: Product;
    price: number;
    slug: string;
    url: string;
  }))[];
  parent?: {
    parent?: {
      title: string;
      url: string;
    };
  } & PageShallowFragment;
  sections?: ({
    subsections?: ({
      subsections?: ({
        content?: ({
          __typename: Exclude<BlockContent, TextBlock>;
        } | {
          __typename: TextBlock;
          html: string;
        });
        heading?: string;
        id: string | number;
      })[];
    } & SectionDeepFragment)[];
  } & SectionDeepFragment)[];
  tags?: string[];
  title: string;
  uuid: string;
} & PageFieldsFragment);
linkable?: (({
  author?: {
    name: string;
  } & PersonBasicFragment;
} & {
  __typename: Article;
  slug: string;
  url: string;
} & Omit<ArticleFieldsFragment, "author">) | {
  __typename: Category;
  children?: {
    name: string;
  }[];
  name: string;
  parent?: {
    name: string;
  };
  slug: string;
  url: string;
} | {
  __typename: Page;
  body?: string;
  parent?: {
    title: string;
  };
  slug: string;
  url: string;
} | {
  __typename: Product;
  price: number;
  slug: string;
  url: string;
  variants?: {
    name: string;
    sku: string;
  }[];
});
media?: ({
  __typename: AudioClip;
  artist?: {
    articles?: ArticleShallowFragment[];
  } & PersonBasicFragment;
  duration?: number;
  id: string | number;
  url: string;
} | {
  __typename: Document;
  filename: string;
  id: string | number;
  uploadedBy?: PersonBasicFragment;
  url: string;
} & DocumentFieldsFragment | {
  __typename: Image;
  alt?: string;
  id: string | number;
  photographer?: PersonFullFragment;
  url: string;
} & ImageFieldsFragment | {
  __typename: Video;
  director?: {
    articles?: ({
      featuredMedia?: ({
        __typename: Exclude<MediaItem, Image>;
      } | {
        __typename: Image;
        url: string;
      });
      title: string;
    })[];
  } & PersonFullFragment;
  duration?: number;
  id: string | number;
  thumbnail?: {
    photographer?: {
      name: string;
    };
  } & ImageFieldsFragment;
  url: string;
} & VideoFieldsFragment);
search: (({
  __typename: Article;
  description?: string;
  id: string | number;
  relatedContent?: (({
    __typename: Article;
    blocks?: (({
      __typename: Exclude<BlockContent, NestedBlock>;
    } | {
      __typename: NestedBlock;
      blocks: {
        __typename: BlockContent;
      }[];
    }))[];
  } & ArticleShallowFragment | {
    __typename: Page;
  }))[];
  slug: string;
  title: string;
  url: string;
  uuid: string;
} & ArticleFieldsFragment | {
  __typename: Page;
  description?: string;
  id: string | number;
  sections?: SectionDeepFragment[];
  slug: string;
  title: string;
  url: string;
  uuid: string;
} & PageFieldsFragment | {
  __typename: Person;
  articles?: ({
    category?: {
      name: string;
    };
  } & ArticleShallowFragment)[];
  id: string | number;
  managedProducts?: {
    price: number;
    title: string;
  }[];
  uuid: string;
} & PersonFullFragment | {
  __typename: Product;
  category?: CategoryDeepFragment;
  description?: string;
  id: string | number;
  media?: (({
    __typename: AudioClip;
    id: string | number;
    url: string;
  } | {
    __typename: Document;
    filename: string;
    id: string | number;
    url: string;
  } | {
    __typename: Image;
    alt?: string;
    id: string | number;
    url: string;
  } | {
    __typename: Video;
    duration?: number;
    id: string | number;
    url: string;
  }))[];
  price: number;
  relatedProducts?: ({
    media?: (({
      __typename: Exclude<MediaItem, Image>;
    } | {
      __typename: Image;
      alt?: string;
      url: string;
    }))[];
    price: number;
    title: string;
  })[];
  slug: string;
  title: string;
  url: string;
  uuid: string;
  variants?: ({
    image?: ImageFieldsFragment;
  } & VariantFieldsFragment)[];
}))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type HorrorNestingQueryVariables = Exact<{
  id: string | number;
  query: string;
}>;