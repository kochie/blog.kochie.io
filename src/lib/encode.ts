import { encode } from 'blurhash'
import { createCanvas, loadImage } from 'canvas'

export async function generateBlurHash(imagePath: string): Promise<string> {
  const image = await loadImage(imagePath)

  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  if (context == null) {
    console.error('bad context retrival, got null')
    return ''
  }
  context.drawImage(image, 0, 0)

  const imageData = context.getImageData(0, 0, image.width, image.height)

  return encode(imageData.data, imageData.width, imageData.height, 9, 9)
}
