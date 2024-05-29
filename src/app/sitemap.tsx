import { buildMetadata } from '@/lib/article-path'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const metadata = await buildMetadata()

  const posts = metadata.articles.map((post) => ({
    url: `https://blog.kochie.io/articles/${post.articleDir}`,
    lastModified: post.editedDate ?? post.publishedDate,
  }))

  const tags = metadata.tags.map((tag) => ({
    url: `https://blog.kochie.io/tags/${tag.name}`,
    lastModified: new Date().toISOString(),
  }))

  const authors = Object.keys(metadata.authors).map((author) => ({
    url: `https://blog.kochie.io/authors/${author}`,
    lastModified: new Date().toISOString(),
  }))

  const routes = [''].map((route) => ({
    url: `https://blog.kochie.io${route}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes, ...posts, ...tags, ...authors]
}
