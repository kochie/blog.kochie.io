import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'fannypack'
import { article } from 'articles.json'
import articles from '../static/articles.json'

interface TagProps {
  taggedArticles: [article]
  tag: string
}

import style from './tagStyle.less'
import { Jumbotron, Gallery } from '../components'
import { ArticleCards } from '../components'
import { NextDocumentContext } from 'next/document'

const { Small, Medium } = ArticleCards

const Tag = ({ taggedArticles, tag }: TagProps) => {
  return (
    <>
      <Head>
        <title>{tag}</title>
      </Head>
      <ThemeProvider>
        <Jumbotron
          height={'50vh'}
          width={'100vw'}
          background={<div className={style.background} />}
        />
        <div className={style.galleryContainer}>
          <Gallery
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
  let taggedArticles: article[]
  if (Array.isArray(tags)) {
    console.log(tags, 'array')
    taggedArticles = articles.filter(article =>
      article.tags.find(tag => tags.includes(tag))
    )
  } else {
    console.log(tags, 'string')
    taggedArticles = articles.filter(article => article.tags.includes(tags))
  }
  return { taggedArticles, tags }
}

export default Tag
