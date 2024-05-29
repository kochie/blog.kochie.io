import React from 'react'
import Image from 'next/image'
import { join } from 'path'

import type { Author } from 'types/metadata'

import { lqip } from '@/lib/shrink'
import { getAllArticlesMetadata } from '@/lib/article-path'
// import metadata from '#/metadata.yaml'
import Error from '../error'
import { Card, Gallery, Jumbotron } from '@/components'
import SMButton from '@/components/SocialMediaButton'
import { Metadata } from 'next'

import metadata from '$metadata'

export async function generateMetadata({
  params,
}: {
  params: { authorId: string }
}): Promise<Metadata> {
  const authorUsername = params.authorId

  const authorDetails = Object.values<Author>(metadata.authors).find(
    (author) => author.username === authorUsername
  )

  if (!authorDetails) return {}

  return {
    title: authorDetails.fullName,
    description: authorDetails.bio,
    alternates: {
      canonical: `https://${
        process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      }/authors/${authorDetails.username}`,
    },
    openGraph: {
      url: `https://${
        process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      }/authors/${authorDetails.username}`,
      title: `${authorDetails.fullName} | Kochie Engineering`,
      description: authorDetails.bio,
      images: [
        {
          url: `https://${
            process.env.NEXT_PUBLIC_PROD_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/_next/image?url=/images/authors/${
            authorDetails.avatar.src
          }&w=640&q=75`,
          alt: authorDetails.username,
        },
      ],
      siteName: 'Kochie Engineering',
    },
  }
}

const AuthorPage = async ({ params }: { params: { authorId: string } }) => {
  const articles = await getAllArticlesMetadata()
  const authorUsername = params.authorId

  const authoredArticles = articles.filter(
    (article) => article.author === authorUsername
  )

  const authorDetails = Object.values<Author>(metadata.authors).find(
    (author) => author.username === authorUsername
  )

  if (!authorDetails) {
    return (
      <Error error={{ name: '404', message: `${authorUsername} not found` }} />
    )
  }

  authorDetails.avatar.lqip = await lqip(
    join(
      process.env.PWD || '',
      '/public/images/authors',
      authorDetails.avatar.src
    )
  )

  return (
    <>
      <div className="">
        <Jumbotron
          width={'100vw'}
          height={'70vh'}
          background={<div className="h-full bg-black" />}
          foreground={
            <div className="top-11 text-white flex h-full text-center flex-col justify-center items-center">
              <div className="cursor-pointer w-32 h-32 mb-8 rounded-full border-4 border-white border-solid transform-gpu hover:scale-125 ease-in-out duration-200 filter grayscale-70 hover:grayscale-0 hover:border-yellow-400 overflow-hidden">
                <Image
                  sizes="100vw"
                  fill
                  src={`/images/authors/${authorDetails.avatar.src}`}
                  alt={`${authorDetails.fullName} Avatar`}
                  blurDataURL={authorDetails.avatar.lqip || ''}
                  placeholder="blur"
                  className="rounded-full mb-2"
                />
              </div>
              <h1 className="mb-4 mt-1 text-3xl">{authorDetails.fullName}</h1>
              <span className="mb-4">{`${authoredArticles.length} articles`}</span>
              <div className="flex flex-row justify-center mt-1 text-2xl gap-1">
                {authorDetails.socialMedia.map((sm) => (
                  <SMButton sm={sm} key={sm.name} />
                ))}
              </div>
              <hr className="w-28 mx-auto my-6" />
              <div className="max-w-xs md:max-w-xl">{authorDetails.bio}</div>
            </div>
          }
        />
      </div>

      {authoredArticles.length > 0 ? (
        <div className="-mt-16">
          <Gallery articles={authoredArticles} />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto -mt-8 mb-8">
          <Card>
            <div className="p-12">
              <p className="text-xl mb-4">Hmm...</p>
              <p>
                {`It looks like ${authorDetails.username} hasn't written
                    anything yet.`}
              </p>
              <p className="mt-2">Come back later for some juicy content.</p>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export const generateStaticParams = async () => {
  return Object.values<Author>(metadata?.authors).map((author) => ({
    authorId: author.username,
  }))
}

export default AuthorPage
