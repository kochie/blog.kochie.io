import { decode } from 'blurhash'
import { createCanvas } from 'canvas'

export function decodeBlurHash(image: string): string {
  const pixels = decode(image, 32, 32)

  const canvas = createCanvas(32, 32)
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(32, 32)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL()
}
