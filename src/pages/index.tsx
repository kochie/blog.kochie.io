import React from 'react'
import { GetStaticProps } from 'next'
import Image from 'next/future/image'

import Jumbotron from '@/components/Jumbotron'
import Gallery from '@/components/Gallery'
import Page from '@/components/Page'
import Heading from '@/components/Heading'

import { ArticleMetadata, getAllArticlesMetadata } from 'src/lib/article-path'
import { NextSeo } from 'next-seo'

import logo from 'public/images/icons/blog-logo.svg'
import jumbotron from 'public/images/umberto-jXd2FSvcRr8-unsplash.jpg'

interface ArticleProps {
  articles: ArticleMetadata[]
}

export const getStaticProps: GetStaticProps = async () => {
  const articles = await getAllArticlesMetadata()
  return { props: { articles } }
}

const Index = ({ articles }: ArticleProps): React.ReactElement => {
  return (
    <>
      <Heading title={'Kochie Engineering'} />
      <NextSeo
        title="Kochie Engineering"
        description="My blog"
        openGraph={{
          url: `https://${
            process.env.NEXT_PUBLIC_PROD_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL ||
            process.env.VERCEL_URL
          }`,
          title: 'Kochie Engineering',
          description: 'My blog',
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
          site_name: 'Kochie Engineering',
        }}
        twitter={{
          handle: '@kochie',
          site: '@kochie',
          cardType: 'summary_large_image',
        }}
      />
      <Page>
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
                <div>
                  <Image
                    width={192}
                    height={192}
                    src={logo}
                    alt={'logo - kochie engineering'}
                    priority
                  />
                </div>
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
      </Page>
    </>
  )
}

export default Index
