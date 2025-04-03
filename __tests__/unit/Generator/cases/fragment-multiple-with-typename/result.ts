// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

/** A comment by an external user. */
type Comment = 'Comment';
/** A domain. */
type Domain = 'Domain';
type MediaImage = 'MediaImage';
type MediaVideo = 'MediaVideo';
/** A blog post. */
type NodeArticle = 'NodeArticle';
type NodePage = 'NodePage';
/** A user. */
type User = 'User';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Entity = 
  | Comment
  | Domain
  | MediaImage
  | MediaVideo
  | NodeArticle
  | NodePage
  | User;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment foobar on NodeArticle {
 *   categories {
 *     related {
 *       __typename
 *       ...nodeArticle
 *       ...nodePage
 *     }
 *   }
 * }
 * ```
 */
export type FoobarFragment = {
  /** Categories of this article. */
  categories?: ({
    /** Related entities. */
  related?: (((NodeArticleFragment & { __typename: NodeArticle }) | NodePageFragment | {
    __typename: Exclude<Entity, NodeArticle | NodePage>;
  }))[];
})[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodeArticle on NodeArticle {
 *   tags
 *   body
 * }
 * ```
 */
export type NodeArticleFragment = {
  /** The body text of the article. */
  body?: string;
  /** The tags. */
  tags?: (string | null)[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment nodePage on NodePage {
 *   __typename
 *   pageId: id
 *   title
 * }
 * ```
 */
export type NodePageFragment = {
  __typename: NodePage;
  /** The ID of the page. */
  pageId: string;
  /** The title of the page. */
  title: string;
};