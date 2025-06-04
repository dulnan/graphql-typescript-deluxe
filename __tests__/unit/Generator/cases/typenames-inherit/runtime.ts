import type {
  MediaFragment,
  MediaImageFragment,
  MediaVideoFragment,
  MediaVideoSingleFragment,
  MediaVideoGrandchildFragment,
} from './result'

export default function (
  mediaFragment: MediaFragment,
  mediaImageFragment: MediaImageFragment,
  mediaVideoFragment: MediaVideoFragment,
  mediaVideoSingleFragment: MediaVideoSingleFragment,
  mediaVideoGrandchildFragment: MediaVideoGrandchildFragment,
): void {
  let notReachable: never

  if (mediaFragment.__typename === 'MediaImage') {
    console.log('test')
  } else if (mediaFragment.__typename === 'MediaVideo') {
    console.log('test')
  } else {
    notReachable = mediaFragment.__typename
  }

  switch (mediaFragment.__typename) {
    case 'MediaImage':
      console.log('test')
      break
    case 'MediaVideo':
      console.log('test')
      break
    default:
      notReachable = mediaFragment.__typename
      break
  }

  // mediaImageFragment.__typename should be unique
  if (mediaImageFragment.__typename === 'MediaImage') {
    console.log('test')
  } else {
    notReachable = mediaImageFragment.__typename
  }

  // @ts-expect-error ts should complain that this comparison is useless.
  if (mediaImageFragment.__typename === 'hello') {
    console.log('test')
  }

  // mediaVideoFragment.__typename should be unique
  if (mediaVideoFragment.__typename === 'MediaVideo') {
    console.log('test')
  } else {
    notReachable = mediaVideoFragment.__typename
  }

  // mediaVideoSingleFragment.__typename should be unique
  if (mediaVideoSingleFragment.__typename !== 'MediaVideo') {
    notReachable = mediaVideoSingleFragment.__typename
  }

  // mediaVideoGrandchildFragment.__typename should be unique
  if (mediaVideoGrandchildFragment.__typename !== 'MediaVideo') {
    notReachable = mediaVideoGrandchildFragment.__typename
  }

  // @ts-expect-error this is just here to make a usage
  console.log(notReachable)
}
