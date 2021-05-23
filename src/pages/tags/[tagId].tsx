import React, { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
// import 'intl-list-format'
// import 'intl-list-format/locale-data/en'
import {
  Jumbotron,
  Gallery,
  ArticleCards,
  Page,
  Heading,
} from '../../components'


import metadata from "../../../metadata.yaml"
import {Tag as TagType} from "metadata.yaml"

import style from '../../styles/tags.module.css'
import { getAllArticlesMetadata } from 'src/lib/article-path'

const { Small, Medium } = ArticleCards

interface TagProps {
  taggedArticles: any
  tags: string
}

const Tag = ({ taggedArticles, tags }: TagProps): ReactElement => {
  const tagDesc = metadata.tags.find((t: TagType) => t.name === tags)?.blurb

  return (
    <>
      <Heading title={tags} />
      <Page>
        <>
          <Jumbotron
            height={'80vh'}
            width={'100vw'}
            background={<div className="bg-black w-full h-full" />}
            foreground={
              <div className="text-center relative h-full flex flex-col justify-center text-white">
                <h1 className="text-4xl mb-6">{tags}</h1>
                <span>{`A collection of ${taggedArticles.length} ${taggedArticles.length > 1 ? 'posts' : 'post'}.`}</span>
                <hr className={style.hr} />
                <div className={style.desc}>
                  <p>{tagDesc}</p>
                </div>
              </div>
            }
          />
          <div className="relative -mt-64">
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

    const lf = new Intl.ListFormat('en', {
      localeMatcher: 'best fit',
      type: 'conjunction',
      style: 'long',
    })

    return { props: { taggedArticles, tags: lf.format(tags) } }
  } else {
    const taggedArticles = await Promise.all(
      articles
        .filter((article) => article.tags.includes(tags))
    )
    return { props: { taggedArticles, tags } }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (!Array.isArray(metadata.tags)) return {paths: [], fallback: false}
  const paths = metadata.tags.map((tag: TagType) => ({
    params: { tagId: tag.name },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default Tag
