import { Feed } from 'feed'
import { ArticleMetadata, buildMetadata } from '@/lib/article-path'
import { getEntries } from './journal-path'
import { writeFile, mkdir, access, readFile } from 'fs/promises'
import { constants } from 'fs'
import { join } from 'path'

import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import remarkGFM from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeLqip from '@/lib/rehype-lqip-plugin'
import remarkUnwrapImages from '@/lib/remark-unwrap-images'
import rehypeVideoRename from '@/lib/rehype-video-rename'
import { buildFeedComponents } from './feed-components'

import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Renders an article's MDX body to static HTML for the RSS/Atom/JSON `content`
 * field. Reuses the same compile pipeline as the article page, but with a
 * dependency-free components map (see feed-components.tsx) since this runs
 * from a plain Node script (bin/prebuild.ts), not the Next.js app.
 */
const renderArticleContent = async (
  article: ArticleMetadata
): Promise<string> => {
  const articleUrl = `https://blog.kochie.io/articles/${article.articleDir}`
  try {
    const mdxSource = await readFile(article.path, 'utf-8')
    const code = String(
      await compile(mdxSource, {
        outputFormat: 'function-body',
        rehypePlugins: [
          rehypeKatex as any,
          rehypeLqip(article.articleDir),
          rehypeVideoRename(article.articleDir),
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

    return renderToStaticMarkup(
      <MDXContent components={buildFeedComponents(articleUrl)} />
    )
  } catch (err) {
    console.error(
      `Failed to render feed content for article "${article.articleDir}", falling back to blurb:`,
      err
    )
    return article.blurb
  }
}

const buildFeed = async (): Promise<Feed> => {
  // This contains site level metadata like title, url, etc
  const feed = new Feed({
    title: 'Kochie Engineering',
    description:
      "Hello I'm Robert! In this blog I talk about engineering, math, and technology.",
    id: 'https://blog.kochie.io/',
    link: 'https://blog.kochie.io/',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: 'https://blog.kochie.io/images/icons/blog-logo-512.png',
    // favicon: 'http://example.com/favicon.ico',
    copyright: `All rights reserved ${new Date().getFullYear()}, Robert Koch`,
    // updated: new Date(2013, 6, 14), // optional, default = today
    generator: 'Kochie Engineering',
    feedLinks: {
      json: 'https://blog.kochie.io/feed/json',
      atom: 'https://blog.kochie.io/feed/atom',
    },
    author: {
      name: 'Robert Koch',
      email: 'robert@kochie.io',
      link: 'https://blog.kochie.io',
    },
  })

  const { articles, authors } = await buildMetadata()
  const now = new Date()
  const publishedArticles = articles.filter(
    (article) => new Date(article.publishedDate) <= now
  )
  for (const article of publishedArticles) {
    const author = Object.values(authors).find(
      (author) => author.username === article.author
    )
    const content = await renderArticleContent(article)
    feed.addItem({
      title: article.title,
      id: `https://blog.kochie.io/articles/${article.articleDir}`,
      link: `https://blog.kochie.io/articles/${article.articleDir}`,
      description: article.blurb,
      content,
      author: [
        {
          name: 'Robert Koch',
          email: 'robert@kochie.io',
          link: 'https://blog.kochie.io',
          avatar: `https://blog.kochie.io/images/authors/${author?.avatar.src}`,
        },
      ],
      category: article.tags.map((tag) => ({ name: tag })),
      date: new Date(article.publishedDate),
      image: `https://blog.kochie.io${article.jumbotron.url}`,
    })
  }

  return feed
}

const buildJournalFeed = async (): Promise<Feed> => {
  const feed = new Feed({
    title: 'Kochie Engineering — Journal',
    description: 'Short observations, links, and thoughts from Robert Koch.',
    id: 'https://blog.kochie.io/journal',
    link: 'https://blog.kochie.io/journal',
    language: 'en',
    copyright: 'All rights reserved 2024, Robert Koch',
    feedLinks: {
      rss: 'https://blog.kochie.io/journal/feed.xml',
    },
    author: {
      name: 'Robert Koch',
      email: 'robert@kochie.io',
      link: 'https://blog.kochie.io',
    },
  })

  const entries = await getEntries()

  entries
    .filter((entry) => {
      const [y, m, d] = entry.slug.split('-').map(Number)
      return new Date(y, m - 1, d) <= new Date()
    })
    .forEach((entry) => {
      const [y, m, d] = entry.slug.split('-').map(Number)
      feed.addItem({
        title: `Journal — ${new Date(y, m - 1, d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        id: `https://blog.kochie.io/journal/${entry.slug}`,
        link: `https://blog.kochie.io/journal/${entry.slug}`,
        description: entry.body.slice(0, 160),
        content: entry.bodyHtml,
        date: new Date(y, m - 1, d),
        category: entry.tags.map((name) => ({ name })),
      })
    })

  return feed
}

export const generateFeeds = async (): Promise<void> => {
  const [articleFeed, journalFeed] = await Promise.all([
    buildFeed(),
    buildJournalFeed(),
  ])

  // Articles feed
  try {
    await access(join(__dirname, '../../public/feed'), constants.F_OK)
  } catch {
    await mkdir(join(__dirname, '../../public/feed'))
  }
  await writeFile(
    join(__dirname, '../../public/feed/rss.xml'),
    articleFeed.rss2()
  )
  await writeFile(
    join(__dirname, '../../public/feed/atom'),
    articleFeed.atom1()
  )
  await writeFile(
    join(__dirname, '../../public/feed/json'),
    articleFeed.json1()
  )

  // Journal feed
  try {
    await access(join(__dirname, '../../public/journal'), constants.F_OK)
  } catch {
    await mkdir(join(__dirname, '../../public/journal'))
  }
  await writeFile(
    join(__dirname, '../../public/journal/feed.xml'),
    journalFeed.rss2()
  )
}
