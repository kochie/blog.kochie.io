import React, {
  IframeHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Article, Heading, Page, HaloInteractive } from '../../components'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { CodeBlock } from 'src/components/CodeBlocks'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import rehypeLqip from '../../lib/rehype-lqip-plugin'

import metadata from '../../../metadata.yaml'
import Metadata, { Author } from 'metadata.yaml'
import {
  getArticleMetadata,
  getArticles,
  ArticleMetadata,
} from 'src/lib/article-path'
import { read } from 'gray-matter'

import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
// import { useRouter } from 'next/router'

interface PostProps {
  articleMetadata: ArticleMetadata
  source: MDXRemoteSerializeResult
  author: Author
}

const H1 = ({ children }: PropsWithChildren<null>): ReactElement => (
  <h1 className="text-xl">{children}</h1>
)

const IMG = ({
  src,
  alt,
  lqip,
}: {
  src: string
  alt: string
  lqip: string
}): ReactElement => {
  // console.log(lqip, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

  return (
    <div>
      <div className="relative w-full h-96 rounded-t-xl overflow-hidden">
        <Image
          src={src}
          objectFit="cover"
          layout="fill"
          placeholder="blur"
          blurDataURL={lqip}
        />
      </div>
      <div className="rounded-b-xl bg-gray-700 text-sm">
        <div className="p-4">{alt}</div>
      </div>
    </div>
  )
}

const Iframe = (props: IframeHTMLAttributes<HTMLDivElement>): ReactElement => (
  <div className="w-full my-10">
    <iframe className="mx-auto" {...props} />
  </div>
)

const P = ({ children }: PropsWithChildren<null>): ReactElement => (
  <div className="my-3">{children}</div>
)

const components = {
  code: CodeBlock,
  h1: H1,
  img: IMG,
  p: P,
  HaloInteractive,
  iframe: Iframe,
}

const ArticlePage = ({
  articleMetadata,
  source,
  author,
}: PostProps): ReactElement => {
  // const router = useRouter()
  // console.log(`${router.basePath}==${router.pathname}`)
  return (
    <>
      <Heading title={articleMetadata.title} />
      <NextSeo
        title={articleMetadata.title}
        description={articleMetadata.blurb}
        canonical={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`}
        openGraph={{
          url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/articles/${articleMetadata.articleDir}`,
          title: articleMetadata.title,
          description: articleMetadata.blurb,
          article: {
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata?.editedDate || '',
            tags: articleMetadata.tags,
            authors: [
              `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/authors/${articleMetadata.author}`,
            ],
          },
          images: [
            {
              url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/_next/image?url=${articleMetadata.jumbotron.url}&w=640&q=75`,
              alt: articleMetadata.jumbotron.alt,
            },
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
        <Article article={articleMetadata} author={author}>
          <MDXRemote {...source} components={components} />
        </Article>
      </Page>
    </>
  )
}

export default ArticlePage

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articleMetadata = await getArticleMetadata(params?.articleId as string)
  const author = (metadata as Metadata).authors?.[articleMetadata.author] || ''

  const mdxSource = await serialize(read(articleMetadata.path).content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeLqip],
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
