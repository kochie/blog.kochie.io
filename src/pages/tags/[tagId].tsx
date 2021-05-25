import React, { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'

import Heading from '@/components/Heading'
import Page from '@/components/Page'
import ArticleCards from '@/components/ArticleCards'
import Gallery from '@/components/Gallery'
import Jumbotron from '@/components/Jumbotron'

import metadata from '../../../metadata.yaml'
import { Tag } from 'metadata.yaml'

import style from '../../styles/tags.module.css'
import { getAllArticlesMetadata } from 'src/lib/article-path'
import { NextSeo } from 'next-seo'

const { Small, Medium } = ArticleCards

interface TagProps {
  taggedArticles: any
  tags: string
  image: {
    src: string
    lqip: string
  }
}

const TagComponent = ({ taggedArticles, tags, image }: TagProps): ReactElement => {
  const tagDesc = metadata.tags.find((t: Tag) => t.name === tags)?.blurb

  return (
    <>
      <Heading title={tags.replace(/^\w/, (c) => c.toUpperCase())} />
      <NextSeo
        title={`${tags} | Kochie Engineering`}
        description={tagDesc}
        openGraph={{
          url: `https://${
            process.env.NEXT_PUBLIC_PROD_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/tags/${tags}`,
          title: `${tags} | Kochie Engineering`,
          description: tagDesc,
          images: [
            {
              url: `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL
              }/_next/image?url=/images/tags/${image.src}&w=640&q=75`,
              alt: tagDesc,
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
            height={'80vh'}
            width={'100vw'}
            background={<div className="bg-black w-full h-full" />}
            foreground={
              <div className="text-center relative h-full flex flex-col justify-center text-white">
                <h1 className="text-4xl mb-6 capitalize">{tags}</h1>
                <span>{`A collection of ${taggedArticles.length} ${
                  taggedArticles.length > 1 ? 'posts' : 'post'
                }.`}</span>
                <hr className={style.hr} />
                <div className={style.desc}>
                  <p>{tagDesc}</p>
                </div>
              </div>
            }
          />
          <div className="relative -mt-32">
            <Gallery
              backgroundColor="transparent"
              cardOrder={[Small, Small, Small, Medium, Medium]}
              articles={taggedArticles}
            />
          </div>
        </>
      </Page>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articles = await getAllArticlesMetadata()

  const tags = params?.tagId || ''

  if (Array.isArray(tags)) {
    const taggedArticles = articles.filter((article) =>
      article.tags.find((tag: string) => tags.includes(tag))
    )

    const image = (metadata.tags as Tag[]).find(
      (tag) => tag.name == tags[0]
    )?.image || { src: '' }

    const lf = new Intl.ListFormat('en', {
      localeMatcher: 'best fit',
      type: 'conjunction',
      style: 'long',
    })

    return { props: { taggedArticles, tags: lf.format(tags), image } }
  } else {
    const taggedArticles = await Promise.all(
      articles.filter((article) => article.tags.includes(tags))
    )
    const image = (metadata.tags as Tag[]).find((tag) => tag.name == tags)
      ?.image || { src: '' }
    return { props: { taggedArticles, tags, image } }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (!Array.isArray(metadata.tags)) return { paths: [], fallback: false }
  const paths = metadata.tags.map((tag: Tag) => ({
    params: { tagId: tag.name },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default TagComponent
