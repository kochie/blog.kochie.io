/* eslint-disable @next/next/no-img-element */
import { getAllArticlesMetadata } from '@/lib/article-path'
import { ImageResponse } from 'next/server'
// import { Roboto_Condensed } from 'next/font/google'

// const font = fetch(
//   new URL('@/assets/fonts/RobotoCondensed-Regular.ttf', import.meta.url)
// ).then((res) => res.arrayBuffer())

// const RobotoCondensed = Roboto_Condensed({
//   weight: ['300'],
//   subsets: ['latin'],
// })

const getAllMetadata = getAllArticlesMetadata()

// export const config = {
//   runtime: 'edge',
// }

export const alt = 'Kochie Engineering'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function og({
  params,
}: {
  params: { articleId: string }
}) {
  // console.log(input)

  const articleId = params.articleId
  const metadata = (await getAllMetadata).find(
    (m) => m.articleDir === articleId
  )

  if (!metadata) return new Response('Not found', { status: 404 })

  // const fontData = await font

  // console.log(process.env)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

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
          src={`${baseUrl}${metadata.jumbotron.url}`}
          alt=""
          tw="absolute w-screen h-screen"
          style={{ filter: 'grayscale(30%)', objectFit: 'cover' }}
        />
        <div
          tw="flex w-screen h-screen flex-col items-start justify-center"
          style={{ fontFamily: 'Roboto Condensed' }}
        >
          <div tw="flex pl-10">
            <span tw="flex text-8xl bg-black text-white rounded-2xl py-4 px-6">
              {metadata.title}
            </span>
          </div>
        </div>
        <img
          alt=""
          src={`${baseUrl}/images/authors/${metadata.author}.png`}
          width="100"
          height="100"
          tw="rounded-3xl absolute bottom-0 right-0 m-8 z-50"
        />
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
      // fonts: [
      //   {
      //     name: 'Roboto Condensed',
      //     data: fontData,
      //     style: 'normal',
      //   },
      // ],
    }
  )
}
