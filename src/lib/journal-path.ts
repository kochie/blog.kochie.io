import { readdir, readFile } from 'node:fs/promises'
import { join } from 'path'
import { cache } from 'react'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

export interface JournalEntry {
  slug: string
  date: string
  tags: string[]
  body: string
  bodyHtml: string
  prev: string | null
  next: string | null
}

export interface MonthGroup {
  label: string
  entries: JournalEntry[]
}

const JOURNAL_DIR = join(process.cwd(), 'journal')

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function rehypeRewriteImagePaths() {
  return (tree: Root) => {
    // Rewrite ./images/X paths to /images/journal/X (where journal/images/ is copied to public/ at build time)
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return
      const src = node.properties?.src
      if (typeof src !== 'string') return
      if (src.startsWith('./images/') || src.startsWith('images/')) {
        node.properties.src =
          '/images/journal/' + src.replace(/^\.?\/?images\//, '')
      }
    })

    // Unwrap <p><img …></p> → <img …> so image siblings don't count as <p> for spacing selectors
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p' || parent == null || index == null) return
      const nonEmpty = node.children.filter(
        (c) => !(c.type === 'text' && c.value.trim() === '')
      )
      if (
        nonEmpty.length === 1 &&
        nonEmpty[0].type === 'element' &&
        (nonEmpty[0] as Element).tagName === 'img'
      ) {
        parent.children.splice(index, 1, nonEmpty[0])
      }
    })
  }
}

/** Transforms `<Spotify link="..." />` MDAST html nodes to Spotify embed iframes. */
function remarkSpotify() {
  return (tree: any) => {
    visit(tree, 'html', (node: any) => {
      const match = node.value.match(
        /<[Ss]potify\s[^>]*link="([^"]+)"[^>]*\/?>/
      )
      if (!match) return
      const link: string = match[1]
      const src = link.replace('open.spotify.com/', 'open.spotify.com/embed/')
      node.value =
        `<div style="border-radius:12px;overflow:hidden;margin:2rem 0">` +
        `<iframe src="${src}" width="100%" height="152" frameborder="0" ` +
        `allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" ` +
        `loading="lazy" style="display:block"></iframe>` +
        `</div>`
    })
  }
}

async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSpotify)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRewriteImagePaths)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
  return String(result)
}

export const getEntries = cache(async (): Promise<JournalEntry[]> => {
  let files: string[]
  try {
    files = await readdir(JOURNAL_DIR)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }

  const mdFiles = files
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse() // lexicographic reverse = newest-date first for YYYY-MM-DD names

  const raw: Omit<JournalEntry, 'prev' | 'next'>[] = await Promise.all(
    mdFiles.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '')
      const content = await readFile(join(JOURNAL_DIR, filename), 'utf-8')
      const { data, content: body } = matter(content)
      const trimmedBody = body.trim()
      return {
        slug,
        date:
          data.date instanceof Date
            ? data.date.toISOString().split('T')[0]
            : String(data.date ?? slug),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        body: trimmedBody,
        bodyHtml: await renderMarkdown(trimmedBody),
      }
    })
  )

  // Fill in prev/next. Array is newest-first.
  return raw.map((entry, i) => ({
    ...entry,
    prev: i < raw.length - 1 ? raw[i + 1].slug : null, // chronologically earlier
    next: i > 0 ? raw[i - 1].slug : null, // chronologically later
  }))
})

export async function getEntryBySlug(
  slug: string
): Promise<JournalEntry | null> {
  const entries = await getEntries()
  return entries.find((e) => e.slug === slug) ?? null
}

export async function getRecentEntries(n: number): Promise<JournalEntry[]> {
  const entries = await getEntries()
  return entries.slice(0, n)
}

export async function getAllJournalTags(): Promise<string[]> {
  const entries = await getEntries()
  const tagSet = new Set<string>()
  for (const entry of entries) {
    for (const tag of entry.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

export function groupEntriesByMonth(entries: JournalEntry[]): MonthGroup[] {
  const buckets = new Map<string, JournalEntry[]>()

  for (const entry of entries) {
    // Parse slug date as local date to avoid timezone shifts
    const [year, month] = entry.slug.split('-').map(Number)
    const key = `${year}-${String(month).padStart(2, '0')}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(entry)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest group first
    .map(([key, groupEntries]) => {
      const [year, month] = key.split('-').map(Number)
      return {
        label: `${MONTH_NAMES[month - 1]} ${year}`,
        entries: groupEntries,
      }
    })
}
