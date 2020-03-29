import React from 'react'
// import Head from 'next/head'
import { Article, Heading, Page } from '../../components'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'
import articles from '../../../public/articles.json'
import authors from '../../../public/authors.json'
import { GetStaticProps, GetStaticPaths } from 'next'
import Error from 'next/error'

interface PostProps {
  article: ArticleMetadata
  author: AuthorMetadata
}

export default ({ article, author }: PostProps) => {
  if (!article) return <Error title={'article not found'} statusCode={404} />

  return (
    <>
      <Heading title={article.title} />
      <Page>
        <Article article={article} author={author} />
      </Page>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const article = articles.find(
    article => article.articleDir === params?.articleId
  )
  if (!article) return { props: { article: null, author: null } }
  const author = authors.find(author => author.username === article.author)
  return { props: { article, author } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = articles.map(article => ({
    params: { articleId: article.articleDir },
  }))

  return {
    paths,
    fallback: false,
  }
}
