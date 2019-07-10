import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'fannypack'
import { Article } from 'components'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'
import articles from '../../static/articles.json'
import authors from '../../static/authors.json'
import { DocumentContext } from 'next/document';
import Error from 'next/error';

interface PostProps {
  article: ArticleMetadata
  author: AuthorMetadata
}

function Post({ article, author }: PostProps) {
  if (!article) return (
    <Error title={"article not found"} statusCode={404} />
  )

  return (
    <>
      <Head>
        <title>{article.title}</title>
      </Head>
      <ThemeProvider>
        <Article article={article} author={author} />
      </ThemeProvider>
    </>
  )
}

Post.getInitialProps = async ({ query }: DocumentContext) => {
  const article = articles.find(article => article.articleDir === query.articleId)
  if (!article) return { article: null, author: null }
  const author = authors.find(author => author.username === article.author)
  return { article, author }
}

export default Post
