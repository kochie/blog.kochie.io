import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkSlug from 'remark-slug'
import remarkMath from 'remark-math'
import remarkGFM from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

import rehypeLqip from '@/lib/rehype-lqip-plugin'
import rehypeTOC from '@/lib/rehype-toc-plugin'

import {
  buildMetadata,
  getArticleMetadata,
  getArticles,
} from '@/lib/article-path'

import { Article, AuthorCardLeft, ConvertKitForm } from '@/components'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

import { Metadata as NextMetadata } from 'next'

import { lqip } from '@/lib/shrink'
import { join } from 'path'
import { copyFile, mkdir, readdir, readFile } from 'fs/promises'
import { components } from '@/components/MDXWrapper/components'

export async function generateMetadata({
  params,
}: {
  params: { articleId: string }
}): Promise<NextMetadata> {
  const articleId = params.articleId
  const metadata = await buildMetadata()
  const articleMetadata = metadata.articles.find(
    (article) => article.articleDir === articleId
  )

  if (!articleMetadata) throw Error('Article Metadata not found.')
  const author = metadata.authors?.[articleMetadata.author] || ''

  return {
    title: articleMetadata.title,
    description: articleMetadata.blurb,
    twitter: {
      card: 'summary_large_image',
      title: `${articleMetadata.title} | Kochie Engineering`,
      creator: '@kochie',
      creatorId: '90334112',
      description: articleMetadata.blurb,
    },
    keywords: [...articleMetadata.tags, ...articleMetadata.keywords],
    alternates: {
      canonical: `/articles/${articleMetadata.articleDir}`,
    },
    openGraph: {
      url: `/articles/${articleMetadata.articleDir}`,
      title: `${articleMetadata.title} | Kochie Engineering`,
      description: articleMetadata.blurb,
      type: 'article',
      publishedTime: articleMetadata.publishedDate,
      modifiedTime: articleMetadata?.editedDate || '',
      tags: [...articleMetadata.tags, ...articleMetadata.keywords],
      authors: [`/authors/${articleMetadata.author}`],
      // images: [
      //   {
      //     url: imageUrl,
      //     alt: articleMetadata.jumbotron.alt,
      //   },
      // ],
      siteName: 'Kochie Engineering',
    },
    other: {
      'fediverse:creator': author.fediverse.creator,
    },
  }
}

const ArticlePage = async ({ params }: { params: { articleId: string } }) => {
  const articleId = params.articleId
  const articleMetadata = await getArticleMetadata(articleId)

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

  const metadata = await buildMetadata()
  let author = metadata.authors?.[articleMetadata.author] || ''
  const lqipString = await lqip(
    join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
  )
  author = { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }

  const mdxSource = await readFile(articleMetadata.path, 'utf-8')
  const code = String(
    await compile(mdxSource, {
      // jsx: true,
      outputFormat: 'function-body',
      rehypePlugins: [
        rehypeTOC,
        rehypeKatex as any,
        rehypeLqip(articleMetadata.articleDir),
        rehypeSlug,
      ],
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkMath,
        remarkSlug as any,
        remarkGFM,
      ],
    })
  )

  const { default: MDXContent } = await run(code, {
    ...(runtime as any),
    baseUrl: import.meta.url,
  })

  // const { content } = await compileMDX({
  //   source: await readFile(articleMetadata.path),
  //   options: {
  //     parseFrontmatter: true,
  //     mdxOptions: {
  //       remarkPlugins: [
  //         remarkMath,
  //         remarkSlug as any,
  //         remarkGFM],
  //       rehypePlugins: [
  //         rehypeTOC,
  //         rehypeKatex as any,
  //         rehypeLqip(articleMetadata.articleDir),
  //         rehypeSlug,
  //       ],
  //     },
  //   },
  //   components,
  // })

  // const imageUrl = new URL(
  //   `https://${
  //     process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  //   }/api/og`
  // )

  // imageUrl.searchParams.set(
  //   'author',
  //   encodeURIComponent(articleMetadata.author)
  // )
  // imageUrl.searchParams.set(
  //   'imageUrl',
  //   encodeURIComponent(articleMetadata.jumbotron.url)
  // )
  // imageUrl.searchParams.set('title', encodeURIComponent(articleMetadata.title))

  return (
    <>
      <Article article={articleMetadata} author={author}>
        <MDXContent components={components} />
      </Article>
      <AuthorCardLeft author={author} />
      <ConvertKitForm formId="4897384" />
    </>
  )
}

export default ArticlePage

export const generateStaticParams = async () => {
  const articles = await getArticles()
  return articles.map((article) => ({
    articleId: article,
  }))
}
