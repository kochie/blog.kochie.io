import React from 'react'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { Jumbotron, Gallery, Page, Heading } from '../components'

// eslint-disable-next-line import/no-unresolved
import { Article } from 'articles.json'
import { getAllArticlesMetadata } from 'src/lib/article-path'
import { NextSeo } from 'next-seo'

const logo = '/images/icons/blog-logo.svg'
const jumbotron = '/images/umberto-jXd2FSvcRr8-unsplash.jpg'

interface ArticleProps {
  articles: Article[]
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
        title='Kochie Engineering'
        description='My blog'
        canonical="https://blog.kochie.io"
        openGraph={{
          url: 'https://blog.kochie.io/',
          title: 'Kochie Engineering',
          description: 'My blog',
          images: [
            {
              url: 'https://blog.kochie.io/images/umberto-jXd2FSvcRr8-unsplash.jpg',
              alt: 'Blog website',
            }
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
                <Image src={jumbotron} layout={'fill'} objectFit={'cover'} />
              </div>
            }
            foreground={
              <div className="absolute flex flex-column items-center top-1/2 left-1/2 transform-gpu -translate-x-1/2 -translate-y-1/2 text-center lg:flex-row lg:pl-36 lg:translate-x-0 lg:left-0 lg:text-left">
                <div>
                  <Image
                    width={192}
                    height={192}
                    src={logo}
                    alt={'logo - kochie engineering'}
                  />
                </div>
                <div className="text-white lg:pl-10">
                  <h1 className="text-3xl font-bold mb-6">{'Kochie Engineering'}</h1>
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
