import type { ImgHTMLAttributes, JSX } from 'react'

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | { src: string }
  alt?: string
  fill?: boolean
  priority?: boolean
  placeholder?: string
  blurDataURL?: string
  unoptimized?: boolean
}

/**
 * Test stub for `next/image`: renders a plain img with the original `src` so
 * jsdom does not request `/_next/image?...` (no dev server in tests).
 */
export default function NextImageMock(props: NextImageProps): JSX.Element {
  const {
    src,
    alt = '',
    width,
    height,
    fill,
    priority: _p,
    placeholder: _pl,
    blurDataURL: _b,
    unoptimized,
    ...rest
  } = props

  const url = typeof src === 'string' ? src : (src?.src ?? '')

  // Surface `unoptimized` as a data attribute so tests can assert that
  // animated formats opt out of next/image's frame-flattening optimizer.
  return (
    <img
      src={url}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      data-unoptimized={unoptimized ? 'true' : undefined}
      {...rest}
    />
  )
}
