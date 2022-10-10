import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/future/image'
import React, { useRef } from 'react'
import { faLeft, faRight } from '@fortawesome/pro-duotone-svg-icons'

export interface CarouselProps {
  images: {
    src: string
    alt: string
  }[]
}

const Carousel = ({ images }: CarouselProps) => {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="relative w-full h-full">
      <div
        className="active:animate-ping absolute top-1/2 bottom-1/2 z-30 rounded p-4 bg-gray-300 hover:bg-gray-600 cursor-pointer left-6 transform duration-200"
        onClick={() => {
          ref.current?.scrollBy({
            left: -500,
            behavior: 'smooth',
          })
        }}
      >
        <FontAwesomeIcon className="fa-stack-1x" icon={faLeft} />
      </div>
      <div
        className="active:animate-ping absolute top-1/2 bottom-1/2 z-30 rounded p-4 bg-gray-300 hover:bg-gray-600 cursor-pointer right-6 transform duration-200"
        onClick={() => {
          ref.current?.scrollBy({
            left: 500,
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
              width="500"
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
