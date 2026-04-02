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
    unoptimized: _u,
    ...rest
  } = props

  const url = typeof src === 'string' ? src : (src?.src ?? '')

  return (
    <img
      src={url}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      {...rest}
    />
  )
}
