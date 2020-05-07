// import React from 'react'
// import Head from 'next/head'
import { Article, Heading, Page } from '../../components'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'
import articles from '../../../public/articles.json'
import authors from '../../../public/authors.json'
import { GetStaticProps, GetStaticPaths } from 'next'
import Error from 'next/error'
import dynamic from 'next/dynamic'

interface PostProps {
  article: ArticleMetadata
  author: AuthorMetadata
  jumbotron: Image
}

const ArticlePage = ({
  article,
  author,
  jumbotron,
}: PostProps): React.ReactElement => {
  if (!article) return <Error title={'article not found'} statusCode={404} />
  const ArticleContent = dynamic(() =>
    import(`articles/${article.articleDir}/index.mdx`)
  )

  return (
    <>
      <Heading title={article.title} />
      <Page>
        <Article article={article} author={author} jumbotron={jumbotron}>
          <ArticleContent />
        </Article>
      </Page>
    </>
  )
}

export default ArticlePage

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const article = articles.find(
    (article) => article.articleDir === params?.articleId
  )
  if (!article) return { props: { article: null, author: null } }
  const jumbotron = (
    await import(`articles/${article.articleDir}/${article.jumbotron.src}`)
  ).default
  const author = authors.find((author) => author.username === article.author)
  return { props: { article, author, jumbotron } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = articles.map((article) => ({
    params: { articleId: article.articleDir },
  }))

  return {
    paths,
    fallback: false,
  }
}
