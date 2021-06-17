import sharp from 'sharp'

export async function lqip(filename: string): Promise<string> {
  const pngBuffer = await sharp(filename)
    .resize(null, 10)
    .toFormat('png')
    .toBuffer()
  const imageData = pngBuffer.toString('base64')
  const url = 'data:image/png;base64,' + imageData
  return url
}
