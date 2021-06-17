import { encode } from 'blurhash'
// import { createCanvas, loadImage } from 'canvas'
import { readFile } from 'fs/promises'
import sharp from 'sharp'

export async function generateBlurHash(imagePath: string): Promise<string> {
  // const image = await loadImage(imagePath)

  // const canvas = createCanvas(image.width, image.height)
  // const context = canvas.getContext('2d')
  // if (context == null) {
  //   console.error('bad context retrival, got null')
  //   return ''
  // }
  // context.drawImage(image, 0, 0)

  // const imageData = context.getImageData(0, 0, image.width, image.height)

  const buf = await readFile(imagePath)
  const image = sharp(buf).raw().ensureAlpha()
  const imageData = await image.toBuffer({ resolveWithObject: true })
  // console.log(imageData)
  const pixels = Uint8ClampedArray.from(imageData.data)
  // console.log(pixels.length)

  return encode(pixels, imageData.info.width, imageData.info.height || 0, 9, 9)

  // return "AAAAAAAAAAAA"
}
