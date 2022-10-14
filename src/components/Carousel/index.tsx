import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/future/image'
import React, { useEffect, useRef, useState } from 'react'
import { faLeft, faRight } from '@fortawesome/pro-duotone-svg-icons'

export interface CarouselProps {
  images: {
    src: string
    alt: string
  }[]
  maxWidth: number
}

const Carousel = ({ images, maxWidth }: CarouselProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (ref.current && !Number.isNaN(ref.current.clientWidth)) {
      setWidth(Math.min(ref.current?.clientWidth ?? maxWidth, maxWidth))
    }
  }, [maxWidth])

  return (
    <div className="static w-full h-full">
      <div
        className="absolute top-1/2 bottom-1/2 z-30 rounded p-4 bg-gray-300 hover:bg-gray-600 cursor-pointer left-24 transform duration-200"
        onClick={() => {
          ref.current?.scrollBy({
            left: -width,
            behavior: 'smooth',
          })
        }}
      >
        <FontAwesomeIcon className="fa-stack-1x" icon={faLeft} />
      </div>
      <div
        className="absolute top-1/2 bottom-1/2 z-30 rounded p-4 bg-gray-300 hover:bg-gray-600 cursor-pointer right-24 transform duration-200"
        onClick={() => {
          ref.current?.scrollBy({
            left: width,
            behavior: 'smooth',
          })
        }}
      >
        <FontAwesomeIcon className="fa-stack-1x" icon={faRight} />
      </div>
      <div
        ref={ref}
        className="rounded-xl relative w-full flex gap-6 snap-mandatory snap-x overflow-x-auto bg-black py-4"
      >
        <div className="snap-center shrink-0">
          <div className="shrink-0 w-40" />
        </div>
        {images.map((image) => (
          <div
            key={image.src}
            className="snap-center shrink-0 first:pl-8 last:pr-8"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={width}
              height="0"
              className="rounded-lg"
            />
          </div>
        ))}
        <div className="snap-center shrink-0">
          <div className="shrink-0 w-40" />
        </div>
      </div>
    </div>
  )
}

export default Carousel
