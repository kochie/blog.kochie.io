import { Feed } from 'feed'
import { buildMetadata } from '@/lib/article-path'
import { getEntries } from './journal-path'
import { writeFile, mkdir, access } from 'fs/promises'
import { constants } from 'fs'
import { join } from 'path'

import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  articles
    .filter((article) => new Date(article.publishedDate) <= now)
    .forEach((article) => {
      const author = Object.values(authors).find(
        (author) => author.username === article.author
      )
      feed.addItem({
        title: article.title,
        id: `https://blog.kochie.io/articles/${article.articleDir}`,
        link: `https://blog.kochie.io/articles/${article.articleDir}`,
        description: article.blurb,
        // content: article.,
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
    })

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
