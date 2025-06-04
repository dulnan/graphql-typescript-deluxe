// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

type MediaImage = 'MediaImage';
type MediaVideo = 'MediaVideo';


// --------------------------------------------------------------------------------
// Interfaces & Unions
// --------------------------------------------------------------------------------

export type Media = MediaImage | MediaVideo;


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment media on Media {
 *   __typename
 *   provider
 * }
 * ```
 */
export type MediaFragment = {
  __typename: Media;
  /** The media provider. */
  provider?: string;
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mediaImage on MediaImage {
 *   ...media
 *   image
 * }
 * ```
 */
export type MediaImageFragment = {
  /** The image URL. */
  image?: string;
} & MediaFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mediaVideo on MediaVideo {
 *   ...media
 *   videoUrl
 * }
 * ```
 */
export type MediaVideoFragment = {
  /** The URL of the video (external). */
  videoUrl?: string;
} & MediaFragment;

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment mediaVideoSingle on MediaVideo {
 *   __typename
 *   videoUrl
 * }
 * ```
 */
export type MediaVideoSingleFragment = {
  __typename: MediaVideo;
  /** The URL of the video (external). */
  videoUrl?: string;
};