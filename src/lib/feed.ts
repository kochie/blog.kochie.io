import { Feed } from 'feed'
import { getAllArticlesMetadata } from '@/lib/article-path'

export const buildFeed = async (): Promise<Feed> => {
  // This contains site level metadata like title, url, etc
  const feed = new Feed({
    title: 'Feed Title',
    description: 'This is my personal feed!',
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
      image: `https://blog.kochie.io/${article.jumbotron.url}`,
    })
  })

  return feed
}
