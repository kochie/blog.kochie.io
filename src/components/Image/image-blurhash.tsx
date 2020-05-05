import { useEffect, useRef, CSSProperties } from 'react'
// import { Blurhash } from "./blurhash";
import { decode } from 'blurhash'
// import Jimp from 'jimp'
import imageStyle from '../../styles/image.module.scss'

export interface ImageProps {
  lqip: string
  src: string
  width?: number | string
  height?: number | string
  alt?: string
  style?: CSSProperties
  className?: string
  loadOnObserve?: boolean
}

const BlurhashImage = ({
  lqip,
  src,
  width,
  height,
  style,
  alt,
  className = '',
  loadOnObserve = false,
}: ImageProps): React.ReactElement => {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function getImage(): Promise<void> {
    try {
      const image = await fetch(src)

      if (!image.ok) {
        console.warn(`image failed to load src: ${src}`)
        return
      }

      const blob = await image.blob()

      if (imgRef.current) {
        imgRef.current.src = URL.createObjectURL(blob)
        imgRef.current.className = imageStyle.sharpen
      } else {
        console.warn('imgRef does not have a current reference!')
      }
    } catch (error) {
      console.error(error)
    }
  }

  function createIntersectionObserver(): IntersectionObserver {
    const observer = new IntersectionObserver((entries, observer) => {
      // console.log(entries.length)
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.current) {
          getImage()
          observer.unobserve(imgRef.current)
        }
      })
    })
    if (imgRef.current) observer.observe(imgRef.current)
    return observer
  }

  useEffect(() => {
    if (!loadOnObserve) getImage()
    else {
      const observer = createIntersectionObserver()
      return (): void => {
        if (imgRef.current) observer.unobserve(imgRef.current)
      }
    }
  })

  // useEffect(() => {

  // }, [])

  const pixels = decode(lqip, 32, 32)
  const imageBlob = new Blob([pixels.buffer], { type: 'image/png' })
  const imageUrl = URL.createObjectURL(imageBlob)

  const containerClasses = [imageStyle.container, className].join(' ')

  return (
    <div className={containerClasses} style={{ ...style, width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />
      <img
        ref={imgRef}
        src={imageUrl}
        width={'100%'}
        height={'100%'}
        className={imageStyle.blur}
        alt={alt}
      />
    </div>
  )
}

export default BlurhashImage
