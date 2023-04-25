import { getAllArticlesMetadata } from '@/lib/article-path'
import { MetadataRoute } from 'next'
import { load } from 'js-yaml'
import { readFile } from 'fs/promises'
import { Metadata } from 'types/metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadata = load(
    await readFile('./metadata.yaml', { encoding: 'utf-8' })
  ) as Metadata

  const allArticles = await getAllArticlesMetadata()

  const posts = allArticles.map((post) => ({
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
