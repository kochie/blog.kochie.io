import React, {
  IframeHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { read } from 'gray-matter'
import * as mdx from '@mdx-js/react'

import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkSlug from 'remark-slug'
import remarkMath from 'remark-math'
import remarkGFM from 'remark-gfm'

import rehypeLqip from '@/lib/rehype-lqip-plugin'
import rehypeTOC, { TOC } from '@/lib/rehype-toc-plugin'
import {
  ArticleMetadata,
  getArticleMetadata,
  getArticles,
} from '@/lib/article-path'

import type { Author, Metadata } from 'types/metadata'
import {
  Quote,
  Revue,
  HaloInteractive,
  Heading,
  Page,
  Article,
  CodeBlock,
  GithubProject,
  Card,
} from '@/components/index'
import Link from 'next/link'
import metadata from '../../../metadata.yaml'

import { smButton } from '../authors'
import styles from '../../styles/list.module.css'
import { lqip } from '@/lib/shrink'
import { join } from 'path'
import { copyFile, mkdir, readdir } from 'fs/promises'

interface PostProps {
  articleMetadata: ArticleMetadata
  source: MDXRemoteSerializeResult
  author: Author
}

const AuthorCard = ({ author }: { author: Author }) => (
  <div className="relative max-w-5xl mx-auto px-4 mb-0 pb-10 mt-10">
    <Card>
      <div className="p-5 flex items-center flex-col justify-center md:justify-start md:flex-row group">
        <div className="w-32 h-32 relative border-4 border-white border-solid rounded-full md:mr-4 overflow-hidden">
          <Link href={'/authors/[authorId]'} as={`/authors/${author.username}`}>
            <a>
              <div className="transition ease-in-out duration-500 filter grayscale-70 group-hover:grayscale-0 w-full h-full">
                <Image
                  layout="fill"
                  src={`/images/authors/${author.avatar.src}`}
                  alt={`${author.fullName} Avatar`}
                  placeholder="blur"
                  blurDataURL={author.avatar.lqip || ''}
                  className="transform-gpu group-hover:scale-110 flex-shrink-0 cursor-pointer transition ease-in-out duration-500"
                />
              </div>
            </a>
          </Link>
        </div>

        <div className="m-4">
          <div className="flex-wrap flex flex-col md:flex-row items-center text-2xl">
            <h1 className={styles.heading}>
              <Link
                href={'/authors/[authorId]'}
                as={`/authors/${author.username}`}
              >
                <a>{author.fullName}</a>
              </Link>
            </h1>
            <div className="flex md:ml-4 md:my-0 my-2 gap-1">
              {author.socialMedia.map((sm) => smButton(sm))}
            </div>
          </div>
          <p className="text-center md:text-left mt-2">{author.bio}</p>
        </div>
      </div>
    </Card>
  </div>
)

interface HeadingProps {
  id?: string
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
  return (
    <h3 className="text-2xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h3>
  )
}

const H4 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h4 className="text-xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h4>
  )
}

const H5 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h5 className="text-lg my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h5>
  )
}

const H6 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h6 className="text-base my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h6>
  )
}

const IMG = ({
  src,
  alt,
  lqip,
}: {
  src?: string
  alt?: string
  lqip?: string
  articleDir?: string
}): ReactElement => {
  const params = new URLSearchParams(src?.split('?')[1])
  let image

  if (params.has('objectFit')) {
    image = (
      <div className="relative w-full h-auto rounded-t-xl overflow-hidden">
        <Image
          src={src || ''}
          layout="responsive"
          height="0"
          width="0"
          alt={alt}
          objectFit={params.get('objectFit') as ImageProps['objectFit']}
          // placeholder="blur"
          // blurDataURL={lqip}
        />
      </div>
    )
  } else if (params.has('intrinsic')) {
    image = (
      <div className="relative rounded-t-xl w-fit overflow-hidden max-h-min flex">
        <Image
          src={src || ''}
          layout="intrinsic"
          objectFit="contain"
          height={params.get('height') || 0}
          width={params.get('width') || 0}
          alt={alt}
        />
      </div>
    )
  } else if (params.has('width') || params.has('height')) {
    image = (
      <div className="relative w-full rounded-t-xl overflow-hidden max-h-min">
        <Image
          src={src || ''}
          layout="responsive"
          height={params.get('height') || 0}
          width={params.get('width') || 0}
          alt={alt}
        />
      </div>
    )
  } else {
    image = (
      <div className="relative w-full h-96 rounded-t-xl overflow-hidden">
        <Image
          src={src || ''}
          objectFit="cover"
          layout="fill"
          placeholder="blur"
          blurDataURL={lqip}
          alt={alt}
        />
      </div>
    )
  }

  return (
    <div className={`mx-auto ${params.has('intrinsic') ? 'w-max' : ''} my-10`}>
      {image}
      <div className="rounded-b-xl bg-gray-700 text-sm text-white">
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

const P = ({ children }: PropsOnlyChildren): ReactElement => {
  if (typeof children === 'string') {
    return <p className="my-3">{children}</p>
  }
  return <div className="my-3">{children}</div>
}

const BLOCKQUOTE = ({ children }: PropsOnlyChildren) => (
  <blockquote className="bg-white px-8 py-2 my-5 rounded-lg text-black">
    {children}
  </blockquote>
)

const ANCHOR = ({
  children,
  href,
  ...props
}: PropsWithChildren<{ href: string }>) => (
  <Link href={href}>
    <a
      {...props}
      className="underline font-bold scroll-my-14 text-yellow-400 hover:text-yellow-600 duration-200"
    >
      {children}
    </a>
  </Link>
)

const CODE = ({ children }: PropsWithChildren<Record<never, never>>) => (
  <code className="dark:bg-gray-800 text-sm p-1 rounded font-mono bg-gray-400 dark:text-white">
    {children}
  </code>
)

const OL = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <ol id={id} className="list-decimal list-outside px-12">
    {children}
  </ol>
)

const UL = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <ul id={id} className="list-inside">
    {children}
  </ul>
)

const LI = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <li id={id} className="list-item">
    {children}
  </li>
)

const SUP = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <sup id={id} style={{ scrollMarginTop: '50px' }}>
    {children}
  </sup>
)

const HR = () => <hr className="my-6 border-2 mx-8" />

type PropsOnlyChildren = {
  children?: ReactNode | undefined
}

const components: React.ComponentProps<typeof mdx.MDXProvider>['components'] = {
  pre: ({ children }: PropsOnlyChildren) => {
    if (!children) return null
    if (
      typeof children === 'string' ||
      typeof children === 'number' ||
      typeof children === 'boolean'
    ) {
      return <pre>{children}</pre>
    }

    // tried this a few times, but it doesn't work
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const className = children.props.className
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const grandChildren = children.props.children
    return <CodeBlock className={className}>{grandChildren}</CodeBlock>
  },
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: IMG,
  p: P,
  ol: OL,
  ul: UL,
  li: LI,
  HaloInteractive,
  iframe: Iframe,
  GithubProject,
  blockquote: BLOCKQUOTE,
  a: ANCHOR,
  code: CODE,
  TOC,
  sup: SUP,
  hr: HR,
  Quote: Quote,
}

const ArticlePage = ({
  articleMetadata,
  source,
  author,
}: PostProps): ReactElement => {
  // const router = useRouter()

  return (
    <>
      <Heading title={articleMetadata.title} />
      <NextSeo
        title={`${articleMetadata.title} | Kochie Engineering`}
        description={articleMetadata.blurb}
        openGraph={{
          url: `https://${
            process.env.NEXT_PUBLIC_PROD_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/articles/${articleMetadata.articleDir}`,
          title: `${articleMetadata.title} | Kochie Engineering`,
          description: articleMetadata.blurb,
          article: {
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata?.editedDate || '',
            tags: articleMetadata.tags,
            authors: [
              `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL
              }/authors/${articleMetadata.author}`,
            ],
          },
          images: [
            {
              url: `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL
              }/images/opengraph/${articleMetadata.articleDir}.png`,
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
          <MDXRemote {...source} components={components} lazy />
        </Article>
        <AuthorCard author={author} />
        <Revue />
      </Page>
    </>
  )
}

export default ArticlePage

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articleMetadata = await getArticleMetadata(params?.articleId as string)

  const files = await readdir(`articles/${articleMetadata.articleDir}`)
  await mkdir(`public/images/articles/${articleMetadata.articleDir}`, {
    recursive: true,
  })
  for (const file of files) {
    if (
      file.endsWith('.png') ||
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.gif') ||
      file.endsWith('.svg')
    ) {
      await copyFile(
        `articles/${articleMetadata.articleDir}/${file}`,
        `public/images/articles/${articleMetadata.articleDir}/${file}`
      )
    }
  }

  let author = (metadata as Metadata).authors?.[articleMetadata.author] || ''
  const lqipString = await lqip(
    join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
  )
  author = { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }

  const mdxSource = await serialize(read(articleMetadata.path).content, {
    mdxOptions: {
      remarkPlugins: [remarkMath, remarkSlug, remarkGFM],
      rehypePlugins: [
        rehypeTOC,
        rehypeKatex,
        rehypeLqip(articleMetadata.articleDir),
        rehypeSlug,
      ],
    },
    // target: ['esnext'],
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
