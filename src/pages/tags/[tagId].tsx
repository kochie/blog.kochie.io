import React from 'react'
import Head from 'next/head'
import { DocumentContext } from 'next/document'
import 'intl-list-format'
import 'intl-list-format/locale-data/en'

import articles from '../../../public/articles.json'
import Articles from 'articles.json'
import style from '../../styles/tagStyle.module.scss'
import { Jumbotron, Gallery, ArticleCards } from '../../components'

const { Small, Medium } = ArticleCards

interface TagProps {
  taggedArticles: Articles
  tags: string
}

declare namespace Intl {
  class ListFormat {
    constructor(locale: string, options: any)

    format(list: string[]): string
  }
}

const Tag = ({ taggedArticles, tags }: TagProps) => {
  return (
    <>
      <Head>
        <title>{tags}</title>
      </Head>
        <Jumbotron
          height={'50vh'}
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
  )
}

Tag.getInitialProps = async ({ query }: DocumentContext) => {
  const tags = query.tagId || ''
  if (Array.isArray(tags)) {
    const taggedArticles = articles.filter(article =>
      article.tags.find(tag => tags.includes(tag))
    )

    if (!('ListFormat' in Intl)) {
      return { taggedArticles, tag: tags.toLocaleString() }
    }

    const lf = new Intl.ListFormat('en', {
      localeMatcher: 'best fit',
      type: 'conjunction',
      style: 'long',
    })

    return { taggedArticles, tags: lf.format(tags) }
  } else {
    const taggedArticles = articles.filter(article =>
      article.tags.includes(tags)
    )
    return { taggedArticles, tags }
  }
}

export default Tag
