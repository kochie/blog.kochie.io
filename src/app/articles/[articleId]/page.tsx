import { serialize } from 'next-mdx-remote/serialize'
import { ArticleJsonLd, NextSeo } from 'next-seo'

import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkSlug from 'remark-slug'
import remarkMath from 'remark-math'
import remarkGFM from 'remark-gfm'

import rehypeLqip from '@/lib/rehype-lqip-plugin'
import rehypeTOC from '@/lib/rehype-toc-plugin'

import { getArticleMetadata, getArticles } from '@/lib/article-path'

import type { Metadata } from 'types/metadata'

import {
  Revue,
  Article,
  AuthorCardLeft,
  Title,
  MDXContent,
} from '@/components/index'

import metadata from '../../../../metadata.yaml'

import { lqip } from '@/lib/shrink'
import { join } from 'path'
import { copyFile, mkdir, readdir, readFile } from 'fs/promises'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'

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

  let author = (metadata as Metadata).authors?.[articleMetadata.author] || ''
  const lqipString = await lqip(
    join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
  )
  author = { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }

  const mdxSource = await serialize(
    (await readFile(articleMetadata.path)).toString(),
    {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkSlug, remarkGFM],
        rehypePlugins: [
          rehypeTOC,
          rehypeKatex,
          rehypeLqip(articleMetadata.articleDir),
          rehypeSlug,
        ],
      },
    }
  )

  const imageUrl = new URL(
    `https://${
      process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    }/api/og`
  )

  imageUrl.searchParams.set(
    'author',
    encodeURIComponent(articleMetadata.author)
  )
  imageUrl.searchParams.set(
    'imageUrl',
    encodeURIComponent(articleMetadata.jumbotron.url)
  )
  imageUrl.searchParams.set('title', encodeURIComponent(articleMetadata.title))

  const title = `${articleMetadata.title} | Kochie Engineering`
  const url = `https://${
    process.env.NEXT_PUBLIC_PROD_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
  }/articles/${articleMetadata.articleDir}`

  return (
    <>
      <Title title={title} />
      <ArticleJsonLd
        useAppDir={true}
        url={url}
        title={articleMetadata.title}
        images={[imageUrl.toString()]}
        datePublished={articleMetadata.publishedDate}
        dateModified={articleMetadata.editedDate}
        authorName={[
          {
            name: author.fullName,
            url: `https://${process.env.NEXT_PUBLIC_PROD_URL}/authors/${articleMetadata.author}`,
          },
        ]}
        publisherName={'Kochie Engineering'}
        publisherLogo={`https://${process.env.NEXT_PUBLIC_PROD_URL}/images/icons/blog-logo-128.png`}
        description={articleMetadata.blurb}
        isAccessibleForFree={true}
      />
      <NextSeo
        {...NEXT_SEO_DEFAULT}
        canonical={`https://blog.kochie.io/articles/${articleMetadata.articleDir}`}
        // linkedin meta tags
        additionalMetaTags={[
          {
            name: 'author',
            content: author.fullName,
          },
        ]}
        openGraph={{
          article: {
            authors: [
              `https://${process.env.NEXT_PUBLIC_PROD_URL}/authors/${author.username}`,
            ],
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata.editedDate,
            tags: articleMetadata.tags,
          },
          description: articleMetadata.blurb,
          images: [
            {
              url: imageUrl.toString(),
              alt: articleMetadata.jumbotron.alt,
              height: 1200,
              width: 630,
            },
          ],
          siteName: 'Kochie Engineering',
          url: `https://${process.env.NEXT_PUBLIC_PROD_URL}/articles/${articleMetadata.articleDir}`,
          type: 'article',
          title,
        }}
      />
      <Article article={articleMetadata} author={author}>
        <MDXContent compiledSource={mdxSource.compiledSource} />
      </Article>
      <AuthorCardLeft author={author} />
      <Revue />
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
