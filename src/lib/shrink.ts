// import jimp from 'jimp'
import sharp from 'sharp'

// export async function lqip(filename: string): Promise<string> {
//   if (filename.endsWith('svg')) return ''
//   const image = await jimp.read(filename)
//   image.resize(jimp.AUTO, 10)
//   return await image.getBase64Async(jimp.MIME_PNG)
// }

export async function lqip(filename: string): Promise<string> {
  if (filename.endsWith('svg')) return ''
  const image = sharp(filename)
  const data = (await image.resize(10).toBuffer()).toString('base64')
  return `data:image/png;base64,${data}`
}
