import { access, readFile, readdir, writeFile } from 'fs/promises'
// import { read } from 'gray-matter'
import pkg from 'gray-matter'
const { read } = pkg
import readingTime from 'reading-time'
import { join } from 'path'
import { lqip } from './shrink'
import { load } from 'js-yaml'
import { Metadata } from 'types/metadata'
import { resolvePodcast } from './podcast-url'

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const ARTICLES_DIR = './articles'

export async function getArticles(): Promise<string[]> {
  if (!(await exists(ARTICLES_DIR))) return []
  const article_directories = (
    await readdir(ARTICLES_DIR, { withFileTypes: true })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  return article_directories
}

export async function buildMetadata() {
  const articlePaths = await getArticles()
  const articles = await Promise.all(
    articlePaths.map((article) => getArticleMatter(article))
  )
  const metadata = load(
    await readFile('./metadata.yaml', { encoding: 'utf-8' })
  ) as Metadata

  return { articles, ...metadata }
}

export async function writeMetadata() {
  const metadata = await buildMetadata()

  await writeFile(
    join(process.cwd(), 'public/articles.json'),
    JSON.stringify(metadata)
  )
}

export async function getAllArticlesMetadata(): Promise<ArticleMetadata[]> {
  const article_directories = await getArticles()
  const current_time = new Date()
  const articles = (
    await Promise.all(
      article_directories.map(
        async (article_dir) => await getArticleMetadata(article_dir)
      )
    )
  )
    .sort((a, b) => {
      const da = new Date(a.publishedDate)
      const db = new Date(b.publishedDate)

      if (da < db) return 1
      if (da > db) return -1
      return 0
    })
    .filter((article) => {
      return new Date(article.publishedDate) <= current_time
    })
  return articles
}

export function getArticleMatter(article_dir: string): ArticleMetadata {
  const file = read(`./articles/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    // @ts-expect-error path does infact exist
    path: file.path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/images/articles/${article_dir}/${file.data?.jumbotron?.src}`,
    },
    publishedDate: file.data?.publishedDate?.toJSON() ?? new Date().toJSON(),
    editedDate: file.data?.editedDate?.toJSON() ?? publishedDate,
    keywords: file.data.keywords ?? [],
    tags: file.data.tags ?? [],
    readTime: readingTime(file.content).text,
    indexPath: `/articles/${article_dir}/index.mdx`,
    articleDir: article_dir,
    featured: file.data.featured === true,
    similar: parseSimilar(file.data.similar),
    project:
      typeof file.data.project === 'string' && file.data.project.length > 0
        ? file.data.project
        : undefined,
    chapter:
      typeof file.data.chapter === 'number' &&
      Number.isInteger(file.data.chapter) &&
      file.data.chapter >= 1
        ? file.data.chapter
        : undefined,
    // The sync caller (sitemap, OG, prev/next) never renders the player, so
    // we skip the network call. getArticleMetadata fills it in for the
    // article page.
  }
}

const parseSimilar = (raw: unknown): string[] | undefined => {
  if (!Array.isArray(raw)) return undefined
  const slugs = raw.filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  )
  return slugs.length > 0 ? slugs : undefined
}

export async function getArticleMetadata(
  article_dir: string
): Promise<ArticleMetadata> {
  const file = read(`./articles/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  const dir = join(
    process.env.PWD || '',
    `./articles/${article_dir}/${file.data?.jumbotron?.src}`
  )

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    // @ts-expect-error path does infact exist
    path: file.path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/images/articles/${article_dir}/${file.data?.jumbotron?.src}`,
      lqip: await lqip(dir),
    },
    publishedDate: file.data?.publishedDate?.toJSON() ?? new Date().toJSON(),
    editedDate: file.data?.editedDate?.toJSON() ?? publishedDate,
    tags: file.data.tags ?? [],
    keywords: file.data.keywords ?? [],
    readTime: readingTime(file.content).text,
    indexPath: `/articles/${article_dir}/index.mdx`,
    articleDir: article_dir,
    featured: file.data.featured === true,
    podcast: await resolvePodcast(file.data.podcast),
    similar: parseSimilar(file.data.similar),
    project:
      typeof file.data.project === 'string' && file.data.project.length > 0
        ? file.data.project
        : undefined,
    chapter:
      typeof file.data.chapter === 'number' &&
      Number.isInteger(file.data.chapter) &&
      file.data.chapter >= 1
        ? file.data.chapter
        : undefined,
  }
}

export interface PodcastMetadata {
  // Direct URL to the audio file. Beehiiv exposes one per episode in their
  // RSS feed (`https://rss.beehiiv.com/podcasts/<show-id>`); we hot-link
  // straight to it so the site player reads the same source the podcast
  // apps do.
  audio: string
  // Optional pre-declared duration in mm:ss or hh:mm:ss. When present we
  // can render the total time before the file metadata loads, avoiding a
  // layout shift on the player.
  duration?: string
}

export interface ArticleMetadata {
  author: string
  path: string
  jumbotron: {
    url: string
    alt: string
    lqip: string
  }
  tags: string[]
  keywords: string[]
  readTime: string
  indexPath: string
  articleDir: string
  publishedDate: string
  editedDate: string
  title: string
  blurb: string
  featured?: boolean
  podcast?: PodcastMetadata
  /**
   * Optional explicit list of related articleDir slugs. When set, takes
   * precedence over the tag-overlap fallback used by findSimilarArticles.
   */
  similar?: string[]
  /**
   * Slug of the project this article belongs to (matches a
   * `projects/<slug>.yaml` manifest filename without the extension).
   * Articles can belong to at most one project.
   */
  project?: string
  /**
   * Optional explicit chapter number within the project. When omitted,
   * chapter numbers fall out of `publishedDate` ascending order, or from
   * the manifest's `order:` list when present.
   */
  chapter?: number
}

/**
 * Extract the leading numeric prefix from an articleDir like "13-lambda-recursion".
 * Returns null when the dir does not start with digits.
 */
export function getArticleNumber(articleDir: string): number | null {
  const match = articleDir.match(/^(\d+)/)
  if (!match) return null
  return parseInt(match[1], 10)
}

/**
 * The "updated" line in the meta row only renders if the edit lands at least
 * 14 days after the original publication. Within that window, edits read as
 * proofreading and would clutter the meta line.
 */
export function shouldShowUpdatedDate(
  publishedDate: string,
  editedDate: string
): boolean {
  const published = new Date(publishedDate).getTime()
  const edited = new Date(editedDate).getTime()
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
  return edited - published >= fourteenDaysMs
}

/**
 * Pick up to `limit` articles related to the current one, in priority order:
 *
 * 1. If the current article's frontmatter declares a `similar` list, resolve
 *    those slugs against `allArticles` and use that order verbatim. Missing
 *    slugs are skipped silently (a typo doesn't break the build).
 * 2. Otherwise, rank the remaining articles by tag overlap (more shared tags
 *    first), breaking ties by publishedDate desc.
 * 3. If either path yields fewer than `limit` picks, top the list up with
 *    the latest articles (publishedDate desc) that aren't already in it.
 *    The article foot should always feel populated — an explicit one-item
 *    `similar` frontmatter still gets two latest essays appended.
 *
 * The current article is always excluded. Returns an empty array only when
 * the archive is too small to fill the slot (e.g. a one-essay site).
 */
export function findSimilarArticles(
  current: ArticleMetadata,
  allArticles: ArticleMetadata[],
  limit = 3
): ArticleMetadata[] {
  const others = allArticles.filter((a) => a.articleDir !== current.articleDir)
  const picked: ArticleMetadata[] = []

  if (current.similar && current.similar.length > 0) {
    const bySlug = new Map(others.map((a) => [a.articleDir, a]))
    for (const slug of current.similar) {
      const match = bySlug.get(slug)
      if (match && !picked.includes(match)) picked.push(match)
      if (picked.length >= limit) break
    }
  } else {
    const currentTags = new Set(current.tags)
    const ranked = others
      .map((a) => ({
        article: a,
        overlap: a.tags.filter((t) => currentTags.has(t)).length,
      }))
      .filter((entry) => entry.overlap > 0)
      .sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap
        return (
          new Date(b.article.publishedDate).getTime() -
          new Date(a.article.publishedDate).getTime()
        )
      })
    for (const entry of ranked) {
      picked.push(entry.article)
      if (picked.length >= limit) break
    }
  }

  // Top up with the latest essays when neither the explicit list nor tag
  // overlap filled the limit. Sort happens once over the remaining pool.
  if (picked.length < limit) {
    const pickedSlugs = new Set(picked.map((a) => a.articleDir))
    const remaining = others
      .filter((a) => !pickedSlugs.has(a.articleDir))
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      )
    for (const a of remaining) {
      picked.push(a)
      if (picked.length >= limit) break
    }
  }

  return picked
}

export interface UsedTag {
  /**
   * Display name. Prefers the metadata.yaml `name` field for proper casing
   * (e.g. "CDK" instead of "cdk"), falling back to the article's literal
   * tag string when no metadata entry exists.
   */
  name: string
  /** URL slug — always lowercased. */
  slug: string
  /** Number of articles carrying this tag. Always > 0 for returned entries. */
  articleCount: number
  /** Authoring blurb from metadata.yaml, when defined. */
  blurb?: string
  /** Tag splash image from metadata.yaml, when defined. */
  image?: { src: string; lqip?: string }
}

type TagLike = { tags: string[] }
type TagMetaLike = {
  name: string
  blurb?: string
  image?: { src: string; lqip?: string }
}

/**
 * Build the canonical tag list from article frontmatter, joined
 * case-insensitively with `metadata.yaml` for display name and authoring
 * metadata. Article tags are the source of truth — metadata.yaml entries
 * that no article references are excluded.
 *
 * Casing rules: `cdk` in an article folds into the metadata entry `CDK`
 * (yielding `name: 'CDK'`, `slug: 'cdk'`). When an article uses a tag with
 * no metadata.yaml entry, the article's literal casing becomes the display
 * name. An article tagged both `Software` and `software` only counts once.
 *
 * Sorted by article count (descending), then alphabetically by display name.
 */
export function getUsedTags(
  articles: TagLike[],
  metadataTags: TagMetaLike[]
): UsedTag[] {
  const metaByLower = new Map(
    metadataTags.map((t) => [t.name.toLowerCase(), t])
  )
  const buckets = new Map<string, { name: string; count: number }>()
  for (const article of articles) {
    const seen = new Set<string>()
    for (const raw of article.tags) {
      const key = raw.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const existing = buckets.get(key)
      if (existing) {
        existing.count += 1
      } else {
        const meta = metaByLower.get(key)
        buckets.set(key, { name: meta?.name ?? raw, count: 1 })
      }
    }
  }
  return Array.from(buckets.entries())
    .map(([slug, { name, count }]) => {
      const meta = metaByLower.get(slug)
      return {
        name,
        slug,
        articleCount: count,
        blurb: meta?.blurb,
        image: meta?.image,
      }
    })
    .sort(
      (a, b) => b.articleCount - a.articleCount || a.name.localeCompare(b.name)
    )
}
