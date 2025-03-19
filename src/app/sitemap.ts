import { buildMetadata } from '@/lib/article-path'
import { MetadataRoute, } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadata = await buildMetadata()

  const posts: MetadataRoute.Sitemap = metadata.articles.map((post) => ({
    url: `https://blog.kochie.io/articles/${post.articleDir.toLowerCase()}`,
    lastModified: post.editedDate ?? post.publishedDate,
  }))

  const tags: MetadataRoute.Sitemap = metadata.tags.map((tag) => ({
    url: `https://blog.kochie.io/tags/${tag.name.toLowerCase()}`,
    lastModified: new Date().toISOString(),
  }))

  const authors: MetadataRoute.Sitemap = Object.keys(metadata.authors).map((author) => ({
    url: `https://blog.kochie.io/authors/${author.toLowerCase()}`,
    lastModified: new Date().toISOString(),
  }))

  const routes: MetadataRoute.Sitemap = [{
    url: `https://blog.kochie.io`,
    lastModified: new Date().toISOString(),
    priority: 1,
    changeFrequency: 'daily',
  }]

  return [...routes, ...posts, ...tags, ...authors]
}
