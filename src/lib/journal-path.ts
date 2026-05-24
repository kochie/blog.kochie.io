import { readdir, readFile } from 'node:fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const mdProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

async function renderMarkdown(md: string): Promise<string> {
  const result = await mdProcessor.process(md)
  return String(result)
}

export async function getEntries(): Promise<JournalEntry[]> {
  let files: string[]
  try {
    files = await readdir(JOURNAL_DIR)
  } catch {
    return []
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
    next: i > 0 ? raw[i - 1].slug : null,               // chronologically later
  }))
}

export async function getEntryBySlug(slug: string): Promise<JournalEntry | null> {
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
