import React from 'react'

interface ImageProps {
  src: string
  width?: number
  height?: number
  hash?: string
}

const Image = ({ src, width, height }: ImageProps): React.ReactElement => {
  return (
    <>
      <img src={src} width={width} height={height} />
    </>
  )
}

export const makeHash = (src: string): string => {
  console.log(src)
  return src
}

export default Image
