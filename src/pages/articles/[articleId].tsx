import React, {
  IframeHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeTOC from 'rehype-toc'
import remarkTOC from 'remark-toc'
import remarkSlug from 'remark-slug'
import { read } from 'gray-matter'
import remarkMath from 'remark-math'

import rehypeLqip from '@/lib/rehype-lqip-plugin'
import {
  ArticleMetadata,
  getArticleMetadata,
  getArticles,
} from '@/lib/article-path'
import CodeBlock from '@/components/CodeBlocks'
import Article from '@/components/Article'
import Page from '@/components/Page'
import Heading from '@/components/Heading'
import { HaloInteractive } from '@/components/Canvasses'
import GithubProject from '@/components/GithubProject'

import metadata from '../../../metadata.yaml'
import type Metadata from 'metadata.yaml'
import type { Author } from 'metadata.yaml'

// import { useRouter } from 'next/router'

interface PostProps {
  articleMetadata: ArticleMetadata
  source: MDXRemoteSerializeResult
  author: Author
}

interface HeadingProps {
  id: string
}

const H1 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h1 className="text-5xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
    {children}
  </h1>
)

const H2 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h2 className="text-3xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
    {children}
  </h2>
)

const H3 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  // console.log(props)
  return (
    <h3 className="text-2xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h3>
  )
}

const IMG = ({
  src,
  alt,
  lqip,
}: {
  src: string
  alt: string
  lqip: string
}): ReactElement => {
  return (
    <div>
      {src.endsWith('svg') ? (
        <div className="relative w-full h-auto rounded-t-xl overflow-hidden">
          <Image src={src} layout="responsive" height="" width="" alt={alt} />
        </div>
      ) : (
        <div className="relative w-full h-96 rounded-t-xl overflow-hidden">
          <Image
            src={src}
            objectFit="cover"
            layout="fill"
            placeholder="blur"
            blurDataURL={lqip}
            alt={alt}
          />
        </div>
      )}
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

const BLOCKQUOTE = ({ children }: PropsWithChildren<Record<never, never>>) => (
  <blockquote className="bg-white px-8 py-2 my-5 rounded-lg text-black">
    {children}
  </blockquote>
)

const ANCHOR = ({
  children,
  ...props
}: PropsWithChildren<Record<never, never>>) => (
  <a {...props} className="underline font-bold">
    {children}
  </a>
)

const components = {
  code: CodeBlock,
  h1: H1,
  h2: H2,
  h3: H3,
  img: IMG,
  p: P,
  HaloInteractive,
  iframe: Iframe,
  GithubProject,
  blockquote: BLOCKQUOTE,
  a: ANCHOR,
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
      remarkPlugins: [remarkMath, remarkTOC, remarkSlug],
      rehypePlugins: [rehypeKatex, rehypeLqip, rehypeSlug],
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
