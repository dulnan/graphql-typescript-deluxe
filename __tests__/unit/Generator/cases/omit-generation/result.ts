// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type Article = 'Article';
type Page = 'Page';
type Product = 'Product';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Content = Article | Page;

export type SearchResult = Article | Page | Product;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment allContentComments on Content {
 *   title
 *   comments {
 *     id
 *     text
 *   }
 *   tags {
 *     slug
 *   }
 * }
 * ```
 */
export type AllContentCommentsFragment = {
  comments?: ({
    id: string | number;
    text: string;
  })[];
  tags?: {
    slug: string;
  }[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment allContentTags on Content {
 *   id
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type AllContentTagsFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthorBasic on Article {
 *   title
 *   author {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ArticleAuthorBasicFragment = {
  author?: {
    id: string | number;
    name: string;
  };
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleAuthorWithAvatar on Article {
 *   body
 *   author {
 *     email
 *     avatar {
 *       url
 *       alt
 *     }
 *   }
 * }
 * ```
 */
export type ArticleAuthorWithAvatarFragment = {
  author?: {
    avatar?: {
      alt?: string;
      url: string;
    };
    email?: string;
  };
  body: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleBase on Article {
 *   id
 *   title
 *   author {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ArticleBaseFragment = {
  author?: {
    id: string | number;
    name: string;
  };
  id: string | number;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleCategoryBasic on Article {
 *   title
 *   category {
 *     id
 *     name
 *     children {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type ArticleCategoryBasicFragment = {
  category?: {
    children?: ({
      id: string | number;
    })[];
    id: string | number;
    name: string;
  };
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleCategoryDeep on Article {
 *   excerpt
 *   category {
 *     slug
 *     children {
 *       name
 *       children {
 *         id
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type ArticleCategoryDeepFragment = {
  category?: {
    children?: ({
      children?: ({
        id: string | number;
        name: string;
      })[];
      name: string;
    })[];
    slug: string;
  };
  excerpt?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleCommentsBasic on Article {
 *   title
 *   comments {
 *     id
 *     text
 *   }
 * }
 * ```
 */
export type ArticleCommentsBasicFragment = {
  comments?: ({
    id: string | number;
    text: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleCommentsWithAuthor on Article {
 *   excerpt
 *   comments {
 *     author {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type ArticleCommentsWithAuthorFragment = {
  comments?: {
    author?: {
      name: string;
    };
  }[];
  excerpt?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleCommentsWithReplies on Article {
 *   body
 *   comments {
 *     likes
 *     replies {
 *       id
 *       text
 *     }
 *   }
 * }
 * ```
 */
export type ArticleCommentsWithRepliesFragment = {
  body: string;
  comments?: ({
    likes?: number;
    replies?: ({
      id: string | number;
      text: string;
    })[];
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleComplete on Article {
 *   ...articleBase
 *   body
 *   author {
 *     email
 *     bio
 *   }
 * }
 * ```
 */
export type ArticleCompleteFragment = ({
  author?: {
    bio?: string;
    email?: string;
    id: string | number;
    name: string;
  };
} & {
  body: string;
} & Omit<ArticleBaseFragment, "author">);

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleExtraTags on Article {
 *   body
 *   tags {
 *     name
 *     slug
 *   }
 * }
 * ```
 */
export type ArticleExtraTagsFragment = {
  body: string;
  tags?: {
    name: string;
    slug: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTagsBasic on Article {
 *   id
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ArticleTagsBasicFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTagsExtended on Article {
 *   body
 *   tags {
 *     slug
 *     color
 *   }
 * }
 * ```
 */
export type ArticleTagsExtendedFragment = {
  body: string;
  tags?: {
    color?: string;
    slug: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleTags on Article {
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ArticleTagsFragment = {
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment articleWithContentTags on Article {
 *   id
 *   title
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type ArticleWithContentTagsFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment baseContentFields on Content {
 *   id
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type BaseContentFieldsFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment contentTagsBasic on Content {
 *   id
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ContentTagsBasicFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment contentTagsExtended on Content {
 *   title
 *   tags {
 *     slug
 *     description
 *   }
 * }
 * ```
 */
export type ContentTagsExtendedFragment = {
  tags?: {
    description?: string;
    slug: string;
  }[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment deepRelatedOne on Article {
 *   id
 *   title
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type DeepRelatedOneFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment deepRelatedTwo on Article {
 *   excerpt
 *   tags {
 *     name
 *   }
 * }
 * ```
 */
export type DeepRelatedTwoFragment = {
  excerpt?: string;
  tags?: {
    name: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment inlineOverlapArticleOne on Article {
 *   title
 *   comments {
 *     id
 *     text
 *   }
 * }
 * ```
 */
export type InlineOverlapArticleOneFragment = {
  comments?: ({
    id: string | number;
    text: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment inlineOverlapArticleTwo on Article {
 *   body
 *   comments {
 *     author {
 *       name
 *     }
 *     likes
 *   }
 * }
 * ```
 */
export type InlineOverlapArticleTwoFragment = {
  body: string;
  comments?: {
    author?: {
      name: string;
    };
    likes?: number;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mixedArticleOne on Article {
 *   title
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type MixedArticleOneFragment = {
  tags?: ({
    id: string | number;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mixedArticleTwo on Article {
 *   body
 *   tags {
 *     name
 *     slug
 *   }
 * }
 * ```
 */
export type MixedArticleTwoFragment = {
  body: string;
  tags?: {
    name: string;
    slug: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nestedUnionArticleOne on Article {
 *   id
 *   title
 *   category {
 *     id
 *   }
 * }
 * ```
 */
export type NestedUnionArticleOneFragment = {
  category?: {
    id: string | number;
  };
  id: string | number;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nestedUnionArticleTwo on Article {
 *   excerpt
 *   category {
 *     name
 *     slug
 *   }
 * }
 * ```
 */
export type NestedUnionArticleTwoFragment = {
  category?: {
    name: string;
    slug: string;
  };
  excerpt?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameAllContentArticle on Article {
 *   id
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type NoTypenameAllContentArticleFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameArticleOne on Article {
 *   title
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type NoTypenameArticleOneFragment = {
  tags?: ({
    id: string | number;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameArticleTwo on Article {
 *   body
 *   tags {
 *     name
 *   }
 * }
 * ```
 */
export type NoTypenameArticleTwoFragment = {
  body: string;
  tags?: {
    name: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameOverlapOne on Article {
 *   title
 *   comments {
 *     id
 *     text
 *   }
 * }
 * ```
 */
export type NoTypenameOverlapOneFragment = {
  comments?: ({
    id: string | number;
    text: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameOverlapTwo on Article {
 *   excerpt
 *   comments {
 *     likes
 *     author {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type NoTypenameOverlapTwoFragment = {
  comments?: {
    author?: {
      name: string;
    };
    likes?: number;
  }[];
  excerpt?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment noTypenameSingleArticle on Article {
 *   id
 *   title
 *   body
 * }
 * ```
 */
export type NoTypenameSingleArticleFragment = {
  body: string;
  id: string | number;
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageSectionsBasic on Page {
 *   title
 *   sections {
 *     id
 *     heading
 *     subsections {
 *       id
 *     }
 *   }
 * }
 * ```
 */
export type PageSectionsBasicFragment = {
  sections?: ({
    heading?: string;
    id: string | number;
    subsections?: ({
      id: string | number;
    })[];
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment pageSectionsWithImage on Page {
 *   body
 *   sections {
 *     content
 *     image {
 *       url
 *     }
 *     subsections {
 *       heading
 *       content
 *     }
 *   }
 * }
 * ```
 */
export type PageSectionsWithImageFragment = {
  body: string;
  sections?: {
    content?: string;
    image?: {
      url: string;
    };
    subsections?: {
      content?: string;
      heading?: string;
    }[];
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment partialArticleTagsExtra on Article {
 *   body
 *   tags {
 *     slug
 *   }
 * }
 * ```
 */
export type PartialArticleTagsExtraFragment = {
  body: string;
  tags?: {
    slug: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment partialArticleTags on Article {
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type PartialArticleTagsFragment = {
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productCategoriesBasic on Product {
 *   id
 *   categories {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type ProductCategoriesBasicFragment = {
  categories?: ({
    id: string | number;
    name: string;
  })[];
  id: string | number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productCategoriesExtended on Product {
 *   name
 *   categories {
 *     slug
 *     parent {
 *       id
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type ProductCategoriesExtendedFragment = {
  categories?: ({
    parent?: {
      id: string | number;
      name: string;
    };
    slug: string;
  })[];
  name: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productImagesBasic on Product {
 *   name
 *   images {
 *     id
 *     url
 *   }
 * }
 * ```
 */
export type ProductImagesBasicFragment = {
  images?: ({
    id: string | number;
    url: string;
  })[];
  name: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productImagesExtended on Product {
 *   price
 *   images {
 *     alt
 *     caption
 *   }
 * }
 * ```
 */
export type ProductImagesExtendedFragment = {
  images?: {
    alt?: string;
    caption?: string;
  }[];
  price: number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productReviewsBasic on Product {
 *   name
 *   reviews {
 *     id
 *     rating
 *     text
 *   }
 * }
 * ```
 */
export type ProductReviewsBasicFragment = {
  name: string;
  reviews?: ({
    id: string | number;
    rating: number;
    text?: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productReviewsWithAuthorDetails on Product {
 *   price
 *   reviews {
 *     author {
 *       id
 *       name
 *       avatar {
 *         url
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type ProductReviewsWithAuthorDetailsFragment = {
  price: number;
  reviews?: ({
    author?: {
      avatar?: {
        url: string;
      };
      id: string | number;
      name: string;
    };
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productVariantsBasic on Product {
 *   name
 *   variants {
 *     id
 *     name
 *     sku
 *   }
 * }
 * ```
 */
export type ProductVariantsBasicFragment = {
  name: string;
  variants?: ({
    id: string | number;
    name: string;
    sku: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment productVariantsWithImage on Product {
 *   price
 *   variants {
 *     price
 *     image {
 *       url
 *       alt
 *     }
 *   }
 * }
 * ```
 */
export type ProductVariantsWithImageFragment = {
  price: number;
  variants?: {
    image?: {
      alt?: string;
      url: string;
    };
    price: number;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchArticleOne on Article {
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type SearchArticleOneFragment = {
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchArticleTwo on Article {
 *   excerpt
 *   tags {
 *     slug
 *   }
 * }
 * ```
 */
export type SearchArticleTwoFragment = {
  excerpt?: string;
  tags?: {
    slug: string;
  }[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchContentFields on Content {
 *   id
 *   title
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type SearchContentFieldsFragment = {
  id: string | number;
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchProductOne on Product {
 *   name
 *   images {
 *     url
 *   }
 * }
 * ```
 */
export type SearchProductOneFragment = {
  images?: {
    url: string;
  }[];
  name: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment searchProductTwo on Product {
 *   price
 *   images {
 *     alt
 *     width
 *   }
 * }
 * ```
 */
export type SearchProductTwoFragment = {
  images?: {
    alt?: string;
    width?: number;
  }[];
  price: number;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment singleArticleFragment on Article {
 *   title
 *   body
 *   tags {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export type SingleArticleFragmentFragment = {
  body: string;
  tags?: ({
    id: string | number;
    name: string;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment unionArticleOne on Article {
 *   title
 *   tags {
 *     id
 *   }
 * }
 * ```
 */
export type UnionArticleOneFragment = {
  tags?: ({
    id: string | number;
  })[];
  title: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment unionArticleTwo on Article {
 *   excerpt
 *   tags {
 *     name
 *     slug
 *   }
 * }
 * ```
 */
export type UnionArticleTwoFragment = {
  excerpt?: string;
  tags?: {
    name: string;
    slug: string;
  }[];
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query AllContentInlineOnly {
 *   allContent {
 *     __typename
 *     id
 *     title
 *     ... on Article {
 *       body
 *       excerpt
 *     }
 *   }
 * }
 * ```
 */
export type AllContentInlineOnlyQuery = {
  allContent: (({
    __typename: Article;
    body: string;
    excerpt?: string;
    id: string | number;
    title: string;
  } | {
    __typename: Page;
    id: string | number;
    title: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query AllContentMixedCoverage {
 *   allContent {
 *     __typename
 *     ... on Article {
 *       ...mixedArticleOne
 *       ...mixedArticleTwo
 *     }
 *     ... on Page {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type AllContentMixedCoverageQuery = {
  allContent: ((({
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & {
    __typename: Article;
  } & Omit<MixedArticleOneFragment, "tags"> & Omit<MixedArticleTwoFragment, "tags">) | {
    __typename: Page;
    title: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query AllContentOverlap {
 *   allContent {
 *     __typename
 *     ...allContentTags
 *     ...allContentComments
 *   }
 * }
 * ```
 */
export type AllContentOverlapQuery = {
  allContent: ({
    __typename: Article | Page;
    comments?: ({
      id: string | number;
      text: string;
    })[];
    id: string | number;
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
    title: string;
  })[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query DeeplyNestedImageOverlap($id: ID!) {
 *   product(id: $id) {
 *     ...productVariantsBasic
 *     ...productVariantsWithImage
 *   }
 * }
 * ```
 */
export type DeeplyNestedImageOverlapQuery = {
  product?: ({
    variants?: ({
      id: string | number;
      image?: {
        alt?: string;
        url: string;
      };
      name: string;
      price: number;
      sku: string;
    })[];
  } & Omit<ProductVariantsBasicFragment, "variants"> & Omit<ProductVariantsWithImageFragment, "variants">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query DeepNestingOverlap($id: ID!) {
 *   article(id: $id) {
 *     ...articleCategoryBasic
 *     ...articleCategoryDeep
 *   }
 * }
 * ```
 */
export type DeepNestingOverlapQuery = {
  article?: ({
    category?: {
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
      slug: string;
    };
  } & Omit<ArticleCategoryBasicFragment, "category"> & Omit<ArticleCategoryDeepFragment, "category">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query DeepPartialCoverage($id: ID!) {
 *   article(id: $id) {
 *     title
 *     relatedArticles {
 *       ...deepRelatedOne
 *       ...deepRelatedTwo
 *     }
 *   }
 * }
 * ```
 */
export type DeepPartialCoverageQuery = {
  article?: {
    relatedArticles?: (({
      tags?: ({
        id: string | number;
        name: string;
      })[];
    } & Omit<DeepRelatedOneFragment, "tags"> & Omit<DeepRelatedTwoFragment, "tags">))[];
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query FragmentSpreadingFragment($id: ID!) {
 *   article(id: $id) {
 *     ...articleComplete
 *   }
 * }
 * ```
 */
export type FragmentSpreadingFragmentQuery = {
  article?: ArticleCompleteFragment;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InlineAndFragmentOverlap($id: ID!) {
 *   article(id: $id) {
 *     ...articleTagsBasic
 *     ... on Article {
 *       tags {
 *         color
 *         description
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type InlineAndFragmentOverlapQuery = {
  article?: ({
    tags?: ({
      color?: string;
      description?: string;
      id: string | number;
      name: string;
    })[];
  } & Omit<ArticleTagsBasicFragment, "tags">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfaceFragmentPlusConcreteOverlap($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ...baseContentFields
 *     ... on Article {
 *       body
 *       tags {
 *         slug
 *         color
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceFragmentPlusConcreteOverlapQuery = {
  content?: ({
    __typename: Article;
    body: string;
    id: string | number;
    tags?: ({
      color?: string;
      id: string | number;
      name: string;
      slug: string;
    })[];
    title: string;
  } | {
    __typename: Page;
    id: string | number;
    tags?: ({
      id: string | number;
      name: string;
    })[];
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfaceFragmentsOverlap($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ...contentTagsBasic
 *     ...contentTagsExtended
 *   }
 * }
 * ```
 */
export type InterfaceFragmentsOverlapQuery = {
  content?: {
    __typename: Article | Page;
    id: string | number;
    tags?: ({
      description?: string;
      id: string | number;
      name: string;
      slug: string;
    })[];
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfaceOnConcreteOverlap($id: ID!) {
 *   article(id: $id) {
 *     ...articleWithContentTags
 *     ...articleExtraTags
 *   }
 * }
 * ```
 */
export type InterfaceOnConcreteOverlapQuery = {
  article?: ({
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & Omit<ArticleWithContentTagsFragment, "tags"> & Omit<ArticleExtraTagsFragment, "tags">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfaceOverlapPlusMinimalInline($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ... on Article {
 *       ...inlineOverlapArticleOne
 *       ...inlineOverlapArticleTwo
 *     }
 *     ... on Page {
 *       title
 *     }
 *   }
 * }
 * ```
 */
export type InterfaceOverlapPlusMinimalInlineQuery = {
  content?: (({
    comments?: ({
      author?: {
        name: string;
      };
      id: string | number;
      likes?: number;
      text: string;
    })[];
  } & {
    __typename: Article;
  } & Omit<InlineOverlapArticleOneFragment, "comments"> & Omit<InlineOverlapArticleTwoFragment, "comments">) | {
    __typename: Page;
    title: string;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfacePartialCoverage($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ... on Article {
 *       ...partialArticleTags
 *       ...partialArticleTagsExtra
 *     }
 *   }
 * }
 * ```
 */
export type InterfacePartialCoverageQuery = {
  content?: (({
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & {
    __typename: Article;
  } & Omit<PartialArticleTagsFragment, "tags"> & Omit<PartialArticleTagsExtraFragment, "tags">) | {
    __typename: Page;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query InterfaceSingleFragmentPartial($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ...singleArticleFragment
 *   }
 * }
 * ```
 */
export type InterfaceSingleFragmentPartialQuery = {
content?: ((SingleArticleFragmentFragment & { __typename: Article }) | {
  __typename: Page;
});
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query MultipleInlineOverlap($id: ID!) {
 *   content(id: $id) {
 *     __typename
 *     ... on Article {
 *       title
 *       tags {
 *         id
 *         name
 *       }
 *     }
 *     ... on Article {
 *       body
 *       tags {
 *         slug
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type MultipleInlineOverlapQuery = {
  content?: ({
    __typename: Article;
    body: string;
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
    title: string;
  } | {
    __typename: Page;
  });
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NestedObjectDifferentSelections($id: ID!) {
 *   article(id: $id) {
 *     ...articleAuthorBasic
 *     ...articleAuthorWithAvatar
 *   }
 * }
 * ```
 */
export type NestedObjectDifferentSelectionsQuery = {
  article?: ({
    author?: {
      avatar?: {
        alt?: string;
        url: string;
      };
      email?: string;
      id: string | number;
      name: string;
    };
  } & Omit<ArticleAuthorBasicFragment, "author"> & Omit<ArticleAuthorWithAvatarFragment, "author">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NestedUnionPartialCoverage($id: ID!) {
 *   article(id: $id) {
 *     title
 *     author {
 *       articles {
 *         ...nestedUnionArticleOne
 *         ...nestedUnionArticleTwo
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type NestedUnionPartialCoverageQuery = {
  article?: {
    author?: {
      articles?: (({
        category?: {
          id: string | number;
          name: string;
          slug: string;
        };
      } & Omit<NestedUnionArticleOneFragment, "category"> & Omit<NestedUnionArticleTwoFragment, "category">))[];
    };
    title: string;
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NoTypenameAllContentPartial {
 *   allContent {
 *     ... on Article {
 *       ...noTypenameAllContentArticle
 *     }
 *   }
 * }
 * ```
 */
export type NoTypenameAllContentPartialQuery = {
  allContent: ((NoTypenameAllContentArticleFragment | object))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NoTypenameOverlapWithObject($id: ID!) {
 *   content(id: $id) {
 *     ... on Article {
 *       ...noTypenameOverlapOne
 *       ...noTypenameOverlapTwo
 *     }
 *   }
 * }
 * ```
 */
export type NoTypenameOverlapWithObjectQuery = {
  content?: (({
    comments?: ({
      author?: {
        name: string;
      };
      id: string | number;
      likes?: number;
      text: string;
    })[];
  } & Omit<NoTypenameOverlapOneFragment, "comments"> & Omit<NoTypenameOverlapTwoFragment, "comments">) | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NoTypenamePartialCoverage($id: ID!) {
 *   content(id: $id) {
 *     ... on Article {
 *       ...noTypenameArticleOne
 *       ...noTypenameArticleTwo
 *     }
 *   }
 * }
 * ```
 */
export type NoTypenamePartialCoverageQuery = {
  content?: (({
    tags?: ({
      id: string | number;
      name: string;
    })[];
  } & Omit<NoTypenameArticleOneFragment, "tags"> & Omit<NoTypenameArticleTwoFragment, "tags">) | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NoTypenameSingleFragment($id: ID!) {
 *   content(id: $id) {
 *     ...noTypenameSingleArticle
 *   }
 * }
 * ```
 */
export type NoTypenameSingleFragmentQuery = {
  content?: (NoTypenameSingleArticleFragment | object);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query NoTypenameUnionPartial($query: String!) {
 *   search(query: $query) {
 *     ... on Article {
 *       title
 *       tags {
 *         id
 *         name
 *       }
 *     }
 *     ... on Product {
 *       name
 *       price
 *     }
 *   }
 * }
 * ```
 */
export type NoTypenameUnionPartialQuery = {
  search: ((object | {
    name: string;
    price: number;
  } | {
    tags?: ({
      id: string | number;
      name: string;
    })[];
    title: string;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query PageSectionsOverlap($id: ID!) {
 *   page(id: $id) {
 *     ...pageSectionsBasic
 *     ...pageSectionsWithImage
 *   }
 * }
 * ```
 */
export type PageSectionsOverlapQuery = {
  page?: ({
    sections?: ({
      content?: string;
      heading?: string;
      id: string | number;
      image?: {
        url: string;
      };
      subsections?: ({
        content?: string;
        heading?: string;
        id: string | number;
      })[];
    })[];
  } & Omit<PageSectionsBasicFragment, "sections"> & Omit<PageSectionsWithImageFragment, "sections">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query ProductMultipleOverlaps($id: ID!) {
 *   product(id: $id) {
 *     ...productImagesBasic
 *     ...productImagesExtended
 *     ...productCategoriesBasic
 *     ...productCategoriesExtended
 *   }
 * }
 * ```
 */
export type ProductMultipleOverlapsQuery = {
  product?: ({
    categories?: ({
      id: string | number;
      name: string;
      parent?: {
        id: string | number;
        name: string;
      };
      slug: string;
    })[];
    images?: ({
      alt?: string;
      caption?: string;
      id: string | number;
      url: string;
    })[];
  } & Omit<ProductImagesBasicFragment, "images"> & Omit<ProductImagesExtendedFragment, "images"> & Omit<ProductCategoriesBasicFragment, "categories"> & Omit<ProductCategoriesExtendedFragment, "categories">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query ProductReviewsOverlap($id: ID!) {
 *   product(id: $id) {
 *     ...productReviewsBasic
 *     ...productReviewsWithAuthorDetails
 *   }
 * }
 * ```
 */
export type ProductReviewsOverlapQuery = {
  product?: ({
    reviews?: ({
      author?: {
        avatar?: {
          url: string;
        };
        id: string | number;
        name: string;
      };
      id: string | number;
      rating: number;
      text?: string;
    })[];
  } & Omit<ProductReviewsBasicFragment, "reviews"> & Omit<ProductReviewsWithAuthorDetailsFragment, "reviews">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query ThreeFragmentsSameNestedField($id: ID!) {
 *   article(id: $id) {
 *     ...articleCommentsBasic
 *     ...articleCommentsWithAuthor
 *     ...articleCommentsWithReplies
 *   }
 * }
 * ```
 */
export type ThreeFragmentsSameNestedFieldQuery = {
  article?: ({
    comments?: ({
      author?: {
        name: string;
      };
      id: string | number;
      likes?: number;
      replies?: ({
        id: string | number;
        text: string;
      })[];
      text: string;
    })[];
  } & Omit<ArticleCommentsBasicFragment, "comments"> & Omit<ArticleCommentsWithAuthorFragment, "comments"> & Omit<ArticleCommentsWithRepliesFragment, "comments">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query TwoFragmentsDifferentArraySelections($id: ID!) {
 *   article(id: $id) {
 *     ...articleTags
 *     ...articleTagsExtended
 *   }
 * }
 * ```
 */
export type TwoFragmentsDifferentArraySelectionsQuery = {
  article?: ({
    tags?: ({
      color?: string;
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & Omit<ArticleTagsFragment, "tags"> & Omit<ArticleTagsExtendedFragment, "tags">);
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query UnionPartialCoverage($query: String!) {
 *   search(query: $query) {
 *     __typename
 *     ... on Article {
 *       ...unionArticleOne
 *       ...unionArticleTwo
 *     }
 *     ... on Product {
 *       name
 *       price
 *     }
 *   }
 * }
 * ```
 */
export type UnionPartialCoverageQuery = {
  search: ((({
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & {
    __typename: Article;
  } & Omit<UnionArticleOneFragment, "tags"> & Omit<UnionArticleTwoFragment, "tags">) | {
    __typename: Page;
  } | {
    __typename: Product;
    name: string;
    price: number;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query UnionWithInterfaceFragment($query: String!) {
 *   search(query: $query) {
 *     __typename
 *     ...searchContentFields
 *     ... on Product {
 *       name
 *       price
 *     }
 *   }
 * }
 * ```
 */
export type UnionWithInterfaceFragmentQuery = {
  search: (({
    __typename: Article | Page;
    id: string | number;
    tags?: ({
      id: string | number;
      name: string;
    })[];
    title: string;
  } | {
    __typename: Product;
    name: string;
    price: number;
  }))[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query UnionWithOverlappingFragments($query: String!) {
 *   search(query: $query) {
 *     __typename
 *     ... on Article {
 *       ...searchArticleOne
 *       ...searchArticleTwo
 *     }
 *     ... on Product {
 *       ...searchProductOne
 *       ...searchProductTwo
 *     }
 *   }
 * }
 * ```
 */
export type UnionWithOverlappingFragmentsQuery = {
  search: ((({
    images?: {
      alt?: string;
      url: string;
      width?: number;
    }[];
  } & {
    __typename: Product;
  } & Omit<SearchProductOneFragment, "images"> & Omit<SearchProductTwoFragment, "images">) | ({
    tags?: ({
      id: string | number;
      name: string;
      slug: string;
    })[];
  } & {
    __typename: Article;
  } & Omit<SearchArticleOneFragment, "tags"> & Omit<SearchArticleTwoFragment, "tags">) | {
    __typename: Page;
  }))[];
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type AllContentInlineOnlyQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type AllContentMixedCoverageQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type AllContentOverlapQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type DeeplyNestedImageOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type DeepNestingOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type DeepPartialCoverageQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type FragmentSpreadingFragmentQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InlineAndFragmentOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfaceFragmentPlusConcreteOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfaceFragmentsOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfaceOnConcreteOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfaceOverlapPlusMinimalInlineQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfacePartialCoverageQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type InterfaceSingleFragmentPartialQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type MultipleInlineOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NestedObjectDifferentSelectionsQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NestedUnionPartialCoverageQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NoTypenameAllContentPartialQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type NoTypenameOverlapWithObjectQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NoTypenamePartialCoverageQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NoTypenameSingleFragmentQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type NoTypenameUnionPartialQueryVariables = Exact<{
  query: string;
}>;

/** @see {@link file://./test.graphql} */
export type PageSectionsOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type ProductMultipleOverlapsQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type ProductReviewsOverlapQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type ThreeFragmentsSameNestedFieldQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type TwoFragmentsDifferentArraySelectionsQueryVariables = Exact<{
  id: string | number;
}>;

/** @see {@link file://./test.graphql} */
export type UnionPartialCoverageQueryVariables = Exact<{
  query: string;
}>;

/** @see {@link file://./test.graphql} */
export type UnionWithInterfaceFragmentQueryVariables = Exact<{
  query: string;
}>;

/** @see {@link file://./test.graphql} */
export type UnionWithOverlappingFragmentsQueryVariables = Exact<{
  query: string;
}>;