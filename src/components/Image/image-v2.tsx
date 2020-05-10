import React, { useRef, useEffect, CSSProperties } from 'react'

import imageStyle from './image.module.css'

interface ImageProps {
  src: string
  lqip: string
  width?: number | string
  height?: number | string
  loadOnObserve?: boolean
  className?: string
  alt?: string
  style?: CSSProperties
}

const Image = ({
  src,
  lqip,
  // width,
  // height,
  loadOnObserve = true,
  className,
  style,
}: ImageProps): React.ReactElement => {
  const imgRef = useRef<HTMLImageElement>(null)

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
          setTimeout(getImage, 2000)
          // getImage()
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

  return (
    <div
      style={{ overflow: 'hidden', width: '100%', height: '100%' }}
      className={className}
    >
      <img
        src={lqip}
        style={style}
        // width={width}
        // height={height}
        ref={imgRef}
        className={`${imageStyle.image}`}
      />
    </div>
  )
}

export default Image
