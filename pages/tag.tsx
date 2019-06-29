import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'fannypack'
import Articles from 'articles.json'
import articles from '../static/articles.json'
import 'intl-list-format'
import 'intl-list-format/locale-data/en'

interface TagProps {
  taggedArticles: Articles
  tags: string
}

import style from './tagStyle.less'
import { Jumbotron, Gallery } from '../components'
import { ArticleCards } from '../components'
import { NextDocumentContext } from 'next/document'

const { Small, Medium } = ArticleCards

const Tag = ({ taggedArticles, tags }: TagProps) => {
  return (
    <>
      <Head>
        <title>{tags}</title>
      </Head>
      <ThemeProvider>
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
      </ThemeProvider>
    </>
  )
}

Tag.getInitialProps = async ({ query }: NextDocumentContext) => {
  const tags = query.tag || ''
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
