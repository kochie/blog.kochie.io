import React from 'react'
// import Head from 'next/head'
// import { DocumentContext } from 'next/document'
import 'intl-list-format'
import 'intl-list-format/locale-data/en'

import articles from '../../../public/articles.json'
import tags from '../../../public/tags.json'
import Articles from 'articles.json'
import style from '../../styles/tagStyle.module.scss'
import { Jumbotron, Gallery, ArticleCards, Page, Heading } from '../../components'
import { GetStaticPaths, GetStaticProps } from 'next'

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

const Tag = ({ taggedArticles, tags }: TagProps) => {
  return (
    <>
      <Heading title={tags}/>
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

    if (!('ListFormat' in Intl)) {
      // await import("intl-list-format");

      // or with commonjs:
      require('intl-list-format')
    }

    // if (!('ListFormat' in Intl)) {
    //   return {props: { taggedArticles, tag: tags.toLocaleString() }}
    // }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const lf = new Intl.ListFormat('en', {
      localeMatcher: 'best fit',
      type: 'conjunction',
      style: 'long',
    })

    return { props: { taggedArticles, tags: lf.format(tags) } }
  } else {
    const taggedArticles = articles.filter((article) =>
      article.tags.includes(tags)
    )
    return { props: { taggedArticles, tags } }
  }

  // return { props: { tags: tagsCounted } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = tags.map((tag) => ({
    params: { tagId: tag.name },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default Tag
