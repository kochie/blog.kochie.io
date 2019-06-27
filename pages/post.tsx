import React from 'react'
// import { withRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { ThemeProvider } from 'fannypack'
import { Article } from '../components'
import { NextDocumentContext } from 'next/document'
import { article } from 'articles.json'
import articles from '../static/articles.json'
import Error from 'next/error'

function Post({ article }: { article: article }) {
  console.log(article)

  return (
    <>
      <Head>
        <title>{article.title}</title>
      </Head>
      <ThemeProvider>
        <Article {...article} />
      </ThemeProvider>
    </>
  )
}

Post.getInitialProps = async ({ query }: NextDocumentContext) => {
  const article = articles.find(article => article.articleFile === query.title)
  //   console.log("SPICE", article, query.slug)
  return { article }
}

export default Post
