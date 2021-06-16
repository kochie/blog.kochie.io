import { decode } from 'blurhash'
import { createCanvas } from 'canvas'

const width = 100
const height = 100

export function decodeBlurHash(image: string): string {
  const pixels = decode(image, width, height)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL()
}
