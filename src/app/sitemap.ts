import {
  buildMetadata,
  getAllArticlesMetadata,
  getUsedTags,
} from '@/lib/article-path'
import { buildProject, getAllProjectManifests } from '@/lib/project-path'
import { getEntries } from '@/lib/journal-path'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadata = await buildMetadata()

  const posts: MetadataRoute.Sitemap = metadata.articles.map((post) => ({
    url: `https://blog.kochie.io/articles/${post.articleDir.toLowerCase()}`,
    lastModified: post.editedDate ?? post.publishedDate,
  }))

  // Only sitemap tags that articles actually use — empty tag pages don't
  // belong in the index.
  const tags: MetadataRoute.Sitemap = getUsedTags(
    metadata.articles,
    metadata.tags
  ).map((tag) => ({
    url: `https://blog.kochie.io/tags/${tag.slug}`,
    lastModified: new Date().toISOString(),
  }))

  // Project pages. lastModified for a project = the most recent editedDate
  // among its members, falling back to startedDate when there are none.
  const manifests = await getAllProjectManifests()
  const allArticles = await getAllArticlesMetadata()
  const projects: MetadataRoute.Sitemap = await Promise.all(
    manifests.map(async (m) => {
      const project = await buildProject(m.slug, allArticles)
      const lastEdit = project.members
        .map((mem) =>
          new Date(
            mem.article.editedDate ?? mem.article.publishedDate
          ).getTime()
        )
        .reduce((acc, t) => (t > acc ? t : acc), 0)
      return {
        url: `https://blog.kochie.io/projects/${project.slug}`,
        lastModified:
          lastEdit > 0 ? new Date(lastEdit).toISOString() : project.startedDate,
      }
    })
  )

  const routes: MetadataRoute.Sitemap = [
    {
      url: `https://blog.kochie.io`,
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: 'https://blog.kochie.io/tags',
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://blog.kochie.io/archive',
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://blog.kochie.io/brand-guide',
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://blog.kochie.io/projects',
      lastModified: new Date().toISOString(),
    },
  ]

  const journalEntries = await getEntries()
  const journalRoutes: MetadataRoute.Sitemap = journalEntries.map((entry) => ({
    url: `https://blog.kochie.io/journal/${entry.slug}`,
    lastModified: entry.date,
  }))

  return [
    ...routes,
    {
      url: 'https://blog.kochie.io/journal',
      lastModified: new Date().toISOString(),
    },
    ...posts,
    ...tags,
    ...projects,
    ...journalRoutes,
  ]
}
