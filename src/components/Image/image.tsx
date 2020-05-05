import { useEffect, useRef, CSSProperties } from 'react'
import imageStyle from '../../styles/image.module.scss'
// import { resolve } from 'url'

export interface ImageProps {
  lqip?: string
  src: string
  width?: number | string
  height?: number | string
  alt?: string
  style?: CSSProperties
  className?: string
  loadOnObserve?: boolean
}

const Image = ({
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

  // async function getImage(): Promise<void> {
  //   try {
  //     const image = await fetch(src)

  //     if (!image.ok) return

  //     const blob = await image.blob()

  //     if (imgRef.current) {
  //       imgRef.current.src = URL.createObjectURL(blob)
  //       imgRef.current.className = imageStyle.sharpen
  //     } else {
  //       console.warn('imgRef does not have a current reference!')
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  async function getImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (imgRef.current) {
          imgRef.current.onload = (): void => {
            imgRef.current?.classList.add(imageStyle.sharpen)
            resolve()
          }
          imgRef.current.src = src
          imgRef.current.onanimationend = (): void =>
            imgRef.current?.classList.remove(
              imageStyle.blur,
              imageStyle.sharpen
            )
        } else {
          console.warn('imgRef does not have a current reference!')
        }
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })
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

  // const containerClasses = [imageStyle.container, className].join(' ')

  return (
    <div
      className={`${imageStyle.container} ${className}`}
      style={{ ...style, width, height }}
    >
      <img
        ref={imgRef}
        src={lqip}
        width={'100%'}
        height={'100%'}
        className={imageStyle.blur}
        alt={alt}
      />
    </div>
  )
}

export default Image
