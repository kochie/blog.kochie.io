import React, { PropsWithChildren } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Article, Heading, Page } from '../../components'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { CodeBlock } from 'src/components/CodeBlocks'
import { NextSeo } from 'next-seo';
import Image from 'next/image'

import metadata from '../../../metadata.yaml'
import Metadata, { Author } from 'metadata.yaml'
import { getArticleMetadata, getArticles, ArticleMetadata } from 'src/lib/article-path'
import matter from 'gray-matter'

import katex from 'rehype-katex'
import remarkMath from 'remark-math'
// import { useRouter } from 'next/router'

interface PostProps {
  articleMetadata: ArticleMetadata
  source: MDXRemoteSerializeResult
  author: Author
}

const components = {
  code: CodeBlock,
  h1: ({ children }: PropsWithChildren<{}>) => (
    <h1 className="text-xl">{children}</h1>
  ),
  img: ({ src, alt }: { src: string; alt: string }) => (
    <div>
      <div className="relative w-full h-96 rounded-t-xl overflow-hidden">
        <Image src={src} objectFit="cover" layout="fill" />
      </div>
      <div className="rounded-b-xl bg-gray-700 text-sm">
        <div className="p-4">{alt}</div>
      </div>
    </div>
  ),
}

const ArticlePage = ({
  articleMetadata,
  source,
  author,
}: PostProps): React.ReactElement => {
  // const router = useRouter()
  // console.log(`${router.basePath}==${router.pathname}`)
  return (
    <>
      <Heading title={articleMetadata.title} />
        <NextSeo
        title={articleMetadata.title}
        description={articleMetadata.blurb}
        canonical="https://blog.kochie.io"
        openGraph={{
          url: `https://blog.kochie.io/articles/${articleMetadata.articleDir}`,
          title: articleMetadata.title,
          description: articleMetadata.blurb,
          article: {
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata?.editedDate || "",
            tags: articleMetadata.tags,
            authors: [
              `https://blog.kochie.io/authors/${articleMetadata.author}`
            ]
          },
          images: [
            {
              url: `https://blog.kochie.io/${articleMetadata.jumbotron.url}`,
              alt: articleMetadata.jumbotron.alt,
            }
          ],
          site_name: 'Kochie Engineering',
        }}
        twitter={{
          handle: '@kochie',
          site: '@kochie',
          cardType: 'summary_large_image',
        }}
      />
      <Page>
        <Article
          article={articleMetadata}
          author={author}
        >
          <MDXRemote {...source} components={components} />
        </Article>
      </Page>
    </>
  )
}

export default ArticlePage

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articleMetadata = getArticleMetadata(params?.articleId as string)
  const author = (metadata as Metadata).authors?.[articleMetadata.author] || ''

  const mdxSource = await serialize(matter.read(articleMetadata.path).content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [katex],
    },
  })
  return { props: { articleMetadata, author, source: mdxSource } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getArticles()
  const paths = articles.map((article) => ({
    params: { articleId: article },
  }))

  return {
    paths,
    fallback: false,
  }
}
