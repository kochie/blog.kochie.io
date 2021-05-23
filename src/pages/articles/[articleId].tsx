import React, { PropsWithChildren } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Article, Heading, Page } from '../../components'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { CodeBlock } from 'src/components/CodeBlocks'
import Image from 'next/image'

import metadata from "../../../metadata.yaml"
import Metadata, {Author} from "metadata.yaml"
import { getArticleMetadata, getArticles } from 'src/lib/article-path'
import matter from 'gray-matter'

import katex from 'rehype-katex'
import remarkMath from 'remark-math'

interface PostProps {
  articleMetadata: any
  source: MDXRemoteSerializeResult
  author: Author
}

const components = {
  code: CodeBlock,
  h1: ({children}: PropsWithChildren<{}>) => (<h1 className="text-xl">{children}</h1>),
  img: ({src, alt}: {src: string, alt: string}) => (
  <div>
    <div className="relative w-full h-96 rounded-t-xl overflow-hidden">
      <Image src={src} objectFit="cover" layout="fill"/>
      </div>
      <div className="rounded-b-xl bg-gray-700 text-sm">
        <div className="p-4">
    {alt}
    </div>
    </div>
    </div>)
}

const ArticlePage = ({
  articleMetadata,
  source,
  author,
}: PostProps): React.ReactElement => {

  return (
    <>
      <Heading title={articleMetadata.title} />
      <Page>
        <Article article={articleMetadata} author={author} jumbotron={articleMetadata.jumbotron}>
          <MDXRemote {...source} components={components} />
        </Article>
      </Page>
    </>
  )
}

export default ArticlePage

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const articleMetadata = getArticleMetadata(params?.articleId as string)
  const author = (metadata as Metadata).authors?.[articleMetadata.author] || ""

  const mdxSource = await serialize(matter.read(articleMetadata.path).content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [katex]
    }
  })
  return { props: { articleMetadata, author, source: mdxSource} }
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
