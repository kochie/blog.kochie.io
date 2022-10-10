import Image from 'next/image'
import React from 'react'

export interface CarouselProps {
  images: {
    src: string
    alt: string
  }[]
}

const Carousel = ({ images }: CarouselProps) => {
  console.log(images)
  return null
  // return (
  //   <div>
  //     {images.map((image) => (
  //       <Image src={image.src} alt={image.alt} key={image.src} />
  //     ))}
  //   </div>
  // )
}

export default Carousel
