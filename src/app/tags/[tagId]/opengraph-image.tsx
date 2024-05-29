import { ImageResponse } from 'next/og'
import metadata from '$metadata'

// TODO: This might not be needed.
export const runtime = 'edge'
export const alt = 'Kochie Engineering'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function og({ params }: { params: { tagId: string } }) {
  const tagId = params.tagId

  const tag = metadata.tags.find((t) => t.name.match(new RegExp(tagId, 'i')))
  if (!tag) return new Response('Tag not found', { status: 404 })

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  if (!metadata) return new Response('Metadata not found', { status: 404 })

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
        }}
      >
        <img
          src={`${baseUrl}/images/tags/${tag.image.src}`}
          alt=""
          tw="absolute w-screen h-screen"
          style={{ filter: 'blur(4px) grayscale(40%)', objectFit: 'cover' }}
        />
        <div
          tw="flex w-screen h-screen flex-col items-start justify-center"
          style={{ fontFamily: 'Roboto Condensed' }}
        >
          <div tw="flex pl-10">
            <span tw="flex text-7xl bg-black text-white rounded-2xl py-4 px-6">
              {tag.name}
            </span>
          </div>
          <div tw="flex pl-10 pt-5">
            <span tw="flex text-2xl bg-black text-white rounded-xl py-2 px-3">
              {tag.blurb}
            </span>
          </div>
        </div>
        {/* <img
          alt=""
          src={`${baseUrl}/images/authors/${metadata.author}.png`}
          width="100"
          height="100"
          tw="rounded-3xl absolute bottom-0 right-0 m-8 z-50"
        /> */}
        <img
          alt=""
          src={`${baseUrl}/images/icons/blog-logo.svg`}
          width="100"
          height="100"
          tw="absolute top-0 right-0 m-8"
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Roboto Condensed',
          data: await getFont(),
          style: 'normal',
        },
      ],
    }
  )
}

async function getFont() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/fonts/RobotoCondensed-Regular.ttf`)

  const fontData = await response.arrayBuffer()
  return fontData
}

// async function getFont(): Promise<Buffer> {
//   // const url = process.env.APP_URL
//   return new Promise((resolve, reject) => {
//     http
//       .get(`http://localhost:3000/fonts/RobotoCondensed-Regular.ttf`, (res) => {
//         const chunks: any[] = []
//         res.on('data', (c) => chunks.push(c))
//         res.on('end', () => resolve(Buffer.concat(chunks)))
//       })
//       .on('error', (err) => {
//         reject(err)
//       })
//   })
// }
