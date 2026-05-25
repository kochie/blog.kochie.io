import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import remarkGFM from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'

import rehypeLqip from '@/lib/rehype-lqip-plugin'
import rehypeTOC from '@/lib/rehype-toc-plugin'
import remarkUnwrapImages from '@/lib/remark-unwrap-images'

import {
  buildMetadata,
  getArticleMetadata,
  getArticles,
  getAllArticlesMetadata,
  findSimilarArticles,
} from '@/lib/article-path'

import {
  Article,
  AuthorCardLeft,
  ChapterPager,
  SimilarArticles,
  SubscribeForm,
} from '@/components'
import { getProjectContext } from '@/lib/project-path'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

import { Metadata as NextMetadata } from 'next'
import { notFound } from 'next/navigation'

import { lqip } from '@/lib/shrink'
import { join } from 'path'
import { copyFile, mkdir, readdir, readFile } from 'fs/promises'
import { components } from '@/components/MDXWrapper/components'
import rehypeVideoRename from '@/lib/rehype-video-rename'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleId: string }>
}): Promise<NextMetadata> {
  const { articleId } = await params
  const metadata = await buildMetadata()
  const articleMetadata = metadata.articles.find(
    (article) => article.articleDir === articleId
  )

  if (!articleMetadata) notFound()
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
      authors: [author.fullName],
      siteName: 'Kochie Engineering',
    },
    other: {
      'fediverse:creator': author.fediverse.creator,
    },
  }
}

interface Params {
  articleId: string
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { articleId } = await params
  let articleMetadata: Awaited<ReturnType<typeof getArticleMetadata>>
  try {
    articleMetadata = await getArticleMetadata(articleId)
  } catch {
    notFound()
  }

  const files = await readdir(`articles/${articleMetadata.articleDir}`)
  // Images and videos are pre-copied at build time via scripts/copy-article-images.mjs.
  // In production (Vercel ISR) the filesystem is read-only, so we attempt the copy
  // opportunistically and silently skip on failure.
  try {
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
  } catch {
    // read-only filesystem in production; images already present from build
  }

  try {
    await mkdir(`public/videos/articles/${articleMetadata.articleDir}`, {
      recursive: true,
    })
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        await copyFile(
          `articles/${articleMetadata.articleDir}/${file}`,
          `public/videos/articles/${articleMetadata.articleDir}/${file}`
        )
      }
    }
  } catch {
    // read-only filesystem in production; videos already present from build
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
        rehypeVideoRename(articleMetadata.articleDir),
        rehypeSlug,
        rehypeMdxCodeProps,
      ],
      remarkPlugins: [
        remarkUnwrapImages,
        remarkRehype,
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkMath,
        remarkGFM,
      ],
    })
  )

  const { default: MDXContent } = await run(code, {
    ...(runtime as any),
    baseUrl: import.meta.url,
  })

  const sortedArticles = await getAllArticlesMetadata()
  const similar = findSimilarArticles(articleMetadata, sortedArticles)
  const projectContext = await getProjectContext(
    articleMetadata,
    sortedArticles
  )

  return (
    <div>
      <Article
        article={articleMetadata}
        author={author}
        projectContext={projectContext}
      >
        <MDXContent components={components} />
      </Article>
      <AuthorCardLeft author={author} />
      {projectContext ? (
        <ChapterPager
          projectSlug={projectContext.project.slug}
          projectTitle={projectContext.project.title}
          prev={projectContext.prev}
          next={projectContext.next}
        />
      ) : (
        <SimilarArticles articles={similar} />
      )}
      <SubscribeForm />
    </div>
  )
}

export const generateStaticParams = async () => {
  const articles = await getArticles()
  return articles.map((article) => ({
    articleId: article,
  }))
}
