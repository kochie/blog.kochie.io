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

import articles from '../../../public/articles.json'
import allTags from '../../../public/tags.json'

// eslint-disable-next-line import/no-unresolved
import Articles from 'articles.json'

import style from '../../styles/tags.module.css'

const { Small, Medium } = ArticleCards

interface TagProps {
  taggedArticles: Articles
  tags: string
}

// declare module 'Intl' {
//   class ListFormat {
//     constructor(locale: string, options: any)

//     format(list: string[]): string
//   }
// }

const Tag = ({ taggedArticles, tags }: TagProps): ReactElement => {
  const tagDesc = allTags.find((t) => t.name === tags)?.blurb

  return (
    <>
      <Heading title={tags} />
      <Page>
        <>
          <Jumbotron
            height={'80vh'}
            width={'100vw'}
            background={<div className={style.background} />}
            foreground={
              <div className={style.foreground}>
                <h1>{tags}</h1>
                <span>{`A collection of ${taggedArticles.length} posts.`}</span>
                <hr className={style.hr} />
                <div className={style.desc}>
                  <p>{tagDesc}</p>
                </div>
              </div>
            }
          />
          <div className={style.galleryContainer}>
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

// Tag.getInitialProps = async ({ query }: DocumentContext) => {
//   const tags = query.tagId || ''
//   if (Array.isArray(tags)) {
//     const taggedArticles = articles.filter(article =>
//       article.tags.find(tag => tags.includes(tag))
//     )

//     if (!('ListFormat' in Intl)) {
//       return { taggedArticles, tag: tags.toLocaleString() }
//     }

//     const lf = new Intl.ListFormat('en', {
//       localeMatcher: 'best fit',
//       type: 'conjunction',
//       style: 'long',
//     })

//     return { taggedArticles, tags: lf.format(tags) }
//   } else {
//     const taggedArticles = articles.filter(article =>
//       article.tags.includes(tags)
//     )
//     return { taggedArticles, tags }
//   }
// }

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tags = params?.tagId || ''
  if (Array.isArray(tags)) {
    const taggedArticles = articles.filter((article) =>
      article.tags.find((tag) => tags.includes(tag))
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
        .map(async (article) => {
          const jumbotron = (
            await import(
              `articles/${article.articleDir}/${article.jumbotron.src}`
            )
          ).default

          const url = jumbotron.url
          const lqip = jumbotron.lqip

          return { ...article, jumbotron: { url, lqip, ...article.jumbotron } }
        })
    )
    return { props: { taggedArticles, tags } }
  }

  // return { props: { tags: tagsCounted } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allTags.map((tag) => ({
    params: { tagId: tag.name },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default Tag
