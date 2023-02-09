/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import React from 'react'

export const config = {
  runtime: 'edge',
}

const font = fetch(
  new URL('../../assets/fonts/RobotoCondensed-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const imageUrl = searchParams.get('imageUrl')
  const author = searchParams.get('author')
  const title = searchParams.get('title')

  const fontData = await font

  if (!imageUrl || !author || !title) {
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
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
        }}
      >
        <img
          src={`https://${process.env.VERCEL_URL}${decodeURIComponent(
            imageUrl
          )}`}
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
              {decodeURIComponent(title)}
            </span>
          </div>
        </div>
        <img
          alt=""
          src={`https://${
            process.env.VERCEL_URL
          }/images/authors/${decodeURIComponent(author)}.png`}
          width="100"
          height="100"
          tw="rounded-3xl absolute bottom-0 right-0 m-8 z-50"
        />
        <img
          alt=""
          src={`https://${process.env.VERCEL_URL}/images/icons/blog-logo.svg`}
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
          data: fontData,
          style: 'normal',
        },
      ],
    }
  )
}
