import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'fannypack'
import { Article } from '../components'
import { NextDocumentContext } from 'next/document'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'
import articles from '../static/articles.json'
import authors from '../static/authors.json'

interface PostProps {
  article: ArticleMetadata
  author: AuthorMetadata
}

function Post({ article, author }: PostProps) {
  return (
    <>
      <Head>
        <title>{article.title}</title>
      </Head>
      <ThemeProvider>
        <Article article={article} author={author}/>
      </ThemeProvider>
    </>
  )
}

Post.getInitialProps = async ({ query }: NextDocumentContext) => {
  const article = articles.find(article => article.articleFile === query.title)
  if (!article) return
  const author = authors.find(author => author.username === article.author)
  return { article, author }
}

export default Post
