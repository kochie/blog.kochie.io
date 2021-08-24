import { Feed } from 'feed'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { writeFile, mkdir, access } from 'fs/promises'
import { constants } from 'fs'
import { join } from 'path'

const buildFeed = async (): Promise<Feed> => {
  // This contains site level metadata like title, url, etc
  const feed = new Feed({
    title: 'Kochie Engineering',
    description:
      "Hello I'm Robert! In this blog I talk about engineering, math, and technology.",
    id: 'http://blog.kochie.io/',
    link: 'http://blog.kochie.io/',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: 'http://blog.kochie.io/images/icons/blog-logo-512.png',
    // favicon: 'http://example.com/favicon.ico',
    copyright: 'All rights reserved 2021, Robert Koch',
    // updated: new Date(2013, 6, 14), // optional, default = today
    generator: 'awesome', // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: 'https://blog.kochie.io/feed/json',
      atom: 'https://blog.kochie.io/feed/atom',
    },
    author: {
      name: 'Robert Koch',
      email: 'robert@kochie.io',
      link: 'https://blog.kochie.io/authors/kochie',
    },
  })

  const articles = await getAllArticlesMetadata()
  articles.forEach((article) => {
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
          link: 'https://blog.kochie.io/authors/kochie',
        },
      ],
      date: new Date(article.publishedDate),
      image: `https://blog.kochie.io${article.jumbotron.url}`,
    })
  })

  return feed
}

export const generateFeeds = async (): Promise<void> => {
  const feed = await buildFeed()

  try {
    await access(join(__dirname, '../../public/feed'), constants.F_OK)
  } catch {
    await mkdir(join(__dirname, '../../public/feed'))
  }

  await writeFile(join(__dirname, '../../public/feed/rss.xml'), feed.rss2())
  await writeFile(join(__dirname, '../../public/feed/atom.xml'), feed.atom1())
  await writeFile(join(__dirname, '../../public/feed/json.xml'), feed.json1())
}
