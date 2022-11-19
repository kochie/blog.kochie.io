import { ImageResponse } from '@vercel/og'
// import Image from 'next/image'
import { NextRequest } from 'next/server'
import React from 'react'

// import logo from '../../../public/images/icons/blog-logo.svg'

export const config = {
  runtime: 'experimental-edge',
}

// const font = fetch(
//   new URL('../../assets/fonts/RobotoCondensed-Regular.ttf', import.meta.url)
// ).then((res) => res.arrayBuffer())

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const articleId = searchParams.get('articleId')
  const imageName = searchParams.get('imageName')
  const author = searchParams.get('author')
  const title = searchParams.get('title')

  // const src = `data:image/jpeg;base64,${(await readFile(p)).toString('base64')}`
  // const avatar = `data:image/png;base64,${(
  //   await readFile(
  //     join(__dirname, '../..', 'public', 'images/authors/kochie.png')
  //   )
  // ).toString('base64')}`

  // const fontData = await font

  // font-[Roboto_Condensed]

  if (!articleId || !imageName || !author || !title) {
    return new ImageResponse(
      <>Provide a title, author, imageName, articleId as a parameter</>,
      {
        width: 1200,
        height: 630,
      }
    )
  }

  return new ImageResponse(
    (
      <div tw="flex w-screen h-screen bg-cover bg-center font-serif">
        <img
          src={`https://blog.kochie.io/images/articles/${articleId}/${imageName}`}
          alt="a"
          tw="absolute w-screen h-screen"
        />
        <div tw="flex backdrop-grayscale-[.2] w-screen h-screen flex-col items-start justify-center">
          <div tw="pl-10">
            <span tw="text-8xl bg-black text-white rounded-2xl p-4">
              {title}
            </span>
          </div>
        </div>
        <div tw="absolute bottom-0 right-0 m-8 z-50">
          {/* <img
            alt=""
            src={`https://blog.kochie.io/images/authors/${author}.png`}
            width="100"
            height="100"
            tw="rounded-3xl"
          /> */}
        </div>
        <div tw="absolute top-0 right-0 m-8">
          {/* <Image alt="" src={logo} width="100" height="100" /> */}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      debug: true,
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
