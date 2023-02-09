import React from 'react'
import Image from 'next/image'

import { Gallery, Jumbotron } from '@/components/index'
import { getAllArticlesMetadata } from '@/lib/article-path'

import jumbotron from 'public/images/umberto-jXd2FSvcRr8-unsplash.jpg'

export const metadata = {
  openGraph: {
    images: [
      {
        url: `https://${
          process.env.NEXT_PUBLIC_PROD_URL ||
          process.env.NEXT_PUBLIC_VERCEL_URL ||
          process.env.VERCEL_URL
        }/_next/image?url=/images/umberto-jXd2FSvcRr8-unsplash.jpg&w=640&q=75`,
        alt: 'Blog website',
      },
    ],
    url: `https://${
      process.env.NEXT_PUBLIC_PROD_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.VERCEL_URL
    }`,
  },
}

export default async function Index() {
  const articles = await getAllArticlesMetadata()
  return (
    <>
      <Jumbotron
        height={'100vh'}
        background={
          <div className="h-screen w-screen absolute object-center object-cover z-10">
            <Image
              src={jumbotron}
              sizes="100vw"
              fill
              alt="PCB circuit board of electronic device"
              placeholder="blur"
              className="object-cover"
            />
          </div>
        }
        foreground={
          <div className="absolute flex flex-col items-center top-1/2 left-1/2 transform-gpu -translate-x-1/2 -translate-y-1/2 text-center lg:flex-row lg:pl-36 lg:translate-x-0 lg:left-0 lg:text-left">
            <picture>
              <img
                width={192}
                height={192}
                src={'/images/icons/blog-logo.svg'}
                alt={'logo - kochie engineering'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
                // fetchPriority="high"
              />
            </picture>
            <div className="text-white lg:pl-10">
              <h1 className="text-3xl font-bold mb-6">
                {'Kochie Engineering'}
              </h1>
              <h2 className="text-2xl font-bold">{'Robert Koch'}</h2>
            </div>
          </div>
        }
      />
      <Gallery articles={articles} />
    </>
  )
}
