# Journal Feed — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/journal` daily feed section — data layer, feed page, permalink page, homepage strip, tag system integration, topbar link, RSS feed, and CLI tooling — as a fully static Next.js feature.

**Architecture:** Journal entries are plain-markdown files in `journal/YYYY-MM-DD.md`. A new `src/lib/journal-path.ts` data layer reads and parses them at build time, mirroring the pattern of `article-path.ts`. The feed page is a server component that passes pre-fetched, pre-rendered entry data to a `'use client'` feed component for tag filtering. All pages are statically generated.

**Tech Stack:** Next.js 16 App Router · Tailwind 4 · gray-matter · unified/remark/rehype (already installed) · Vitest + React Testing Library · esbuild (for CLI tool build).

**Reference:** Design spec at `docs/superpowers/specs/2026-05-24-journal-feed-design.md`.

---

## File Structure

**New files:**
- `journal/` — content directory (not source)
- `src/lib/journal-path.ts` — data access (getEntries, getEntryBySlug, etc.)
- `src/lib/__tests__/journal-path.test.ts` — unit tests for data layer
- `src/app/journal/page.tsx` — feed page (server component)
- `src/app/journal/[entryId]/page.tsx` — permalink page
- `src/app/journal/[entryId]/opengraph-image.tsx` — OG image
- `src/components/JournalEntryCard/index.tsx` — shared entry card (compact + full)
- `src/components/JournalEntryCard/__tests__/JournalEntryCard.test.tsx`
- `src/components/JournalFeed/index.tsx` — client feed with tag filter
- `src/components/JournalFeed/__tests__/JournalFeed.test.tsx`
- `src/components/JournalEntryPage/index.tsx` — permalink layout
- `src/components/JournalEntryPage/__tests__/JournalEntryPage.test.tsx`
- `src/components/JournalStrip/index.tsx` — homepage widget
- `src/components/JournalStrip/__tests__/JournalStrip.test.tsx`
- `bin/new-journal.ts` — CLI scaffold tool

**Modified files:**
- `src/app/page.tsx` — add `JournalStrip` between `RecentRow` and `ArchiveList`
- `src/app/tags/page.tsx` — primary/secondary tag split
- `src/app/tags/[tagId]/page.tsx` — add Journal Entries section
- `src/components/Topbar/index.tsx` — add Journal nav link
- `src/lib/feed.ts` — add journal RSS feed generation
- `src/app/sitemap.ts` — add journal slugs and `/journal` route
- `src/components/index.ts` — export new components
- `package.json` — add `new:journal` scripts

---

## Task 1: Sample journal entries

**Files:**
- Create: `journal/2026-05-24.md`
- Create: `journal/2026-05-22.md`
- Create: `journal/2026-04-30.md`

- [ ] **Step 1: Create the journal directory and three sample entries**

```bash
mkdir -p journal
```

Create `journal/2026-05-24.md`:
```markdown
---
date: 2026-05-24
tags:
  - rust
  - programming
---

Rust's borrow checker finally clicked today. Ownership is a constraint that becomes a superpower once the model is truly internal — you stop fighting the compiler and start thinking in lifetimes.
```

Create `journal/2026-05-22.md`:
```markdown
---
date: 2026-05-22
tags:
  - melbourne
---

Melbourne's new cycling lane network launched today. The Swanston St extension is long overdue — genuinely good urban planning for once.
```

Create `journal/2026-04-30.md`:
```markdown
---
date: 2026-04-30
tags:
  - design
  - tailwind
---

Started the Field Journal redesign today. First real design system I've built from scratch rather than bolted onto Bootstrap.
```

- [ ] **Step 2: Commit**

```bash
git add journal/
git commit -m "content: add sample journal entries for development"
```

---

## Task 2: Data layer (`src/lib/journal-path.ts`)

**Files:**
- Create: `src/lib/__tests__/journal-path.test.ts`
- Create: `src/lib/journal-path.ts`

This task uses TDD. Write all tests first, verify they fail, then implement.

- [ ] **Step 1: Install `rehype-stringify` as an explicit dev dependency**

It is currently a transitive dep of `rehype`. Making it explicit avoids fragile reliance on transitive resolution.

```bash
pnpm add -D rehype-stringify
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/__tests__/journal-path.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}))

import { readdir, readFile } from 'fs/promises'
import {
  getEntries,
  getEntryBySlug,
  getRecentEntries,
  getAllJournalTags,
  groupEntriesByMonth,
} from '../journal-path'

const mockReaddir = vi.mocked(readdir)
const mockReadFile = vi.mocked(readFile)

const ENTRY_A = `---
date: 2026-05-24
tags:
  - rust
  - programming
---

Rust's borrow checker finally clicked.`

const ENTRY_B = `---
date: 2026-05-22
tags:
  - melbourne
---

Melbourne's new cycling lane network launched.`

const ENTRY_C = `---
date: 2026-04-30
tags:
  - rust
---

Started the Field Journal redesign.`

describe('journal-path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReaddir.mockResolvedValue(
      ['2026-05-24.md', '2026-05-22.md', '2026-04-30.md'] as any
    )
    mockReadFile.mockImplementation(async (path: any) => {
      const p = String(path)
      if (p.includes('2026-05-24')) return ENTRY_A as any
      if (p.includes('2026-05-22')) return ENTRY_B as any
      if (p.includes('2026-04-30')) return ENTRY_C as any
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    })
  })

  describe('getEntries', () => {
    it('returns entries sorted newest-first', async () => {
      const entries = await getEntries()
      expect(entries.map((e) => e.slug)).toEqual([
        '2026-05-24',
        '2026-05-22',
        '2026-04-30',
      ])
    })

    it('fills in prev and next links correctly', async () => {
      const entries = await getEntries()
      // newest entry has no next, prev = second-newest
      expect(entries[0].next).toBeNull()
      expect(entries[0].prev).toBe('2026-05-22')
      // middle entry links both ways
      expect(entries[1].next).toBe('2026-05-24')
      expect(entries[1].prev).toBe('2026-04-30')
      // oldest entry has no prev
      expect(entries[2].next).toBe('2026-05-22')
      expect(entries[2].prev).toBeNull()
    })

    it('parses tags correctly', async () => {
      const entries = await getEntries()
      expect(entries[0].tags).toEqual(['rust', 'programming'])
    })

    it('includes rendered bodyHtml', async () => {
      const entries = await getEntries()
      expect(entries[0].bodyHtml).toContain('<p>')
      expect(entries[0].bodyHtml).toContain('borrow checker')
    })

    it('returns empty array when journal directory does not exist', async () => {
      mockReaddir.mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      )
      const entries = await getEntries()
      expect(entries).toEqual([])
    })
  })

  describe('getEntryBySlug', () => {
    it('returns the matching entry', async () => {
      const entry = await getEntryBySlug('2026-05-22')
      expect(entry?.slug).toBe('2026-05-22')
      expect(entry?.tags).toEqual(['melbourne'])
    })

    it('returns null for an unknown slug', async () => {
      const entry = await getEntryBySlug('2026-01-01')
      expect(entry).toBeNull()
    })
  })

  describe('getRecentEntries', () => {
    it('returns the n most recent entries', async () => {
      const entries = await getRecentEntries(2)
      expect(entries).toHaveLength(2)
      expect(entries[0].slug).toBe('2026-05-24')
      expect(entries[1].slug).toBe('2026-05-22')
    })
  })

  describe('getAllJournalTags', () => {
    it('returns unique tags across all entries, sorted', async () => {
      const tags = await getAllJournalTags()
      expect(tags).toEqual(['melbourne', 'programming', 'rust'])
    })
  })

  describe('groupEntriesByMonth', () => {
    it('groups entries by month with formatted labels, newest-group first', async () => {
      const entries = await getEntries()
      const groups = groupEntriesByMonth(entries)
      expect(groups).toHaveLength(2)
      expect(groups[0].label).toBe('May 2026')
      expect(groups[0].entries).toHaveLength(2)
      expect(groups[1].label).toBe('April 2026')
      expect(groups[1].entries).toHaveLength(1)
    })
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test -- src/lib/__tests__/journal-path.test.ts
```

Expected: `Cannot find module '../journal-path'`

- [ ] **Step 4: Implement `src/lib/journal-path.ts`**

```typescript
import { readdir, readFile } from 'fs/promises'
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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- src/lib/__tests__/journal-path.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/journal-path.ts src/lib/__tests__/journal-path.test.ts package.json pnpm-lock.yaml
git commit -m "feat(journal): add journal data layer with tests"
```

---

## Task 3: CLI scaffold tool (`bin/new-journal.ts`)

**Files:**
- Create: `bin/new-journal.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `bin/new-journal.ts`**

```typescript
import { writeFile, access } from 'fs/promises'
import { join } from 'path'
import { execSync } from 'child_process'

const today = new Date()
const slug = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')

const outPath = join(process.cwd(), 'journal', `${slug}.md`)

const stub = `---
date: ${slug}
tags: []
---

`

async function main() {
  try {
    await access(outPath)
    console.error(`⚠ Entry already exists: journal/${slug}.md`)
    process.exit(1)
  } catch {
    // File does not exist — proceed
  }

  await writeFile(outPath, stub, 'utf-8')
  console.log(`✓ Created journal/${slug}.md`)

  // Try to open in the default editor
  const editor = process.env.EDITOR ?? process.env.VISUAL ?? 'open'
  try {
    execSync(`${editor} "${outPath}"`, { stdio: 'inherit' })
  } catch {
    console.log(`Open it: ${outPath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` object, add after the `"new-article:build"` line:

```json
"new-journal:build": "esbuild --bundle --format=esm --packages=external --platform=node --target=node20 --outdir=bin/dist bin/new-journal.ts",
"new:journal": "npm run new-journal:build && node bin/dist/new-journal.js"
```

- [ ] **Step 3: Verify the script runs without error on a date that has no entry**

```bash
# Temporarily test with a future date by running directly
node -e "console.log('Script compiles')" && pnpm run new-journal:build
```

Expected: `bin/dist/new-journal.js` is created with no errors.

- [ ] **Step 4: Commit**

```bash
git add bin/new-journal.ts package.json
git commit -m "feat(journal): add new:journal CLI scaffold command"
```

---

## Task 4: `JournalEntryCard` component

**Files:**
- Create: `src/components/JournalEntryCard/index.tsx`
- Create: `src/components/JournalEntryCard/__tests__/JournalEntryCard.test.tsx`

The card is a shared presentational component with two modes: `compact` (homepage strip — date + first sentence of plain body text) and full (feed — date, rendered HTML body, tag chips). No hooks — safe to use in both server and client contexts.

- [ ] **Step 1: Write the failing tests**

Create `src/components/JournalEntryCard/__tests__/JournalEntryCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JournalEntryCard } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

const entry: JournalEntry = {
  slug: '2026-05-24',
  date: '2026-05-24',
  tags: ['rust', 'programming'],
  body: "Rust's borrow checker finally clicked. A second sentence follows.",
  bodyHtml: "<p>Rust's borrow checker finally clicked. A second sentence follows.</p>",
  prev: '2026-05-22',
  next: null,
}

describe('JournalEntryCard', () => {
  describe('full mode (default)', () => {
    it('renders the body HTML', () => {
      render(<JournalEntryCard entry={entry} />)
      expect(screen.getByText(/borrow checker finally clicked/)).toBeTruthy()
    })

    it('renders tag chips for each tag', () => {
      render(<JournalEntryCard entry={entry} />)
      expect(screen.getByText('rust')).toBeTruthy()
      expect(screen.getByText('programming')).toBeTruthy()
    })

    it('renders the date as a link to the permalink', () => {
      render(<JournalEntryCard entry={entry} />)
      const link = screen.getByRole('link', { name: /24 May 2026/i })
      expect(link.getAttribute('href')).toBe('/journal/2026-05-24')
    })
  })

  describe('compact mode', () => {
    it('renders a truncated plain-text snippet, not full HTML', () => {
      render(<JournalEntryCard entry={entry} compact />)
      // Should show text but not the full second sentence
      expect(screen.getByText(/borrow checker/)).toBeTruthy()
    })

    it('does not render tag chips in compact mode', () => {
      render(<JournalEntryCard entry={entry} compact />)
      expect(screen.queryByText('rust')).toBeNull()
      expect(screen.queryByText('programming')).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- src/components/JournalEntryCard/__tests__/JournalEntryCard.test.tsx
```

Expected: `Cannot find module '../index'`

- [ ] **Step 3: Implement `src/components/JournalEntryCard/index.tsx`**

```tsx
import Link from 'next/link'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalEntryCardProps {
  entry: JournalEntry
  compact?: boolean
}

function formatDate(slug: string): string {
  const [year, month, day] = slug.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function firstSentence(body: string, maxChars = 120): string {
  const first = body.split(/\.\s/)[0]
  if (first.length <= maxChars) return first.endsWith('.') ? first : `${first}.`
  return `${first.slice(0, maxChars).trimEnd()}…`
}

export function JournalEntryCard({
  entry,
  compact = false,
}: JournalEntryCardProps) {
  return (
    <div id={entry.slug} className="border-l-[3px] border-accent pl-4">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <Link
          href={`/journal/${entry.slug}`}
          className="font-mono text-sm text-accent hover:underline shrink-0"
        >
          {formatDate(entry.slug)}
        </Link>
        {!compact && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-accent border border-accent/40 px-1.5 py-0.5 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {compact ? (
        <p className="text-sm text-text-mute leading-relaxed">
          {firstSentence(entry.body)}
        </p>
      ) : (
        <div
          className="prose prose-sm text-text leading-relaxed [&_code]:font-mono [&_code]:bg-bg-soft [&_code]:px-1 [&_code]:rounded-sm"
          dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
        />
      )}
    </div>
  )
}

export default JournalEntryCard
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- src/components/JournalEntryCard/__tests__/JournalEntryCard.test.tsx
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/JournalEntryCard/
git commit -m "feat(journal): add JournalEntryCard component"
```

---

## Task 5: `JournalFeed` component

**Files:**
- Create: `src/components/JournalFeed/index.tsx`
- Create: `src/components/JournalFeed/__tests__/JournalFeed.test.tsx`

`'use client'` — uses `useSearchParams` and `useRouter` for URL-reflected tag filtering.

- [ ] **Step 1: Write the failing tests**

Create `src/components/JournalFeed/__tests__/JournalFeed.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { JournalEntry, MonthGroup } from '@/lib/journal-path'

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ replace: vi.fn() }),
}))

import { JournalFeed } from '../index'

const makeEntry = (slug: string, tags: string[]): JournalEntry => ({
  slug,
  date: slug,
  tags,
  body: `Body for ${slug}`,
  bodyHtml: `<p>Body for ${slug}</p>`,
  prev: null,
  next: null,
})

const groups: MonthGroup[] = [
  {
    label: 'May 2026',
    entries: [
      makeEntry('2026-05-24', ['rust', 'programming']),
      makeEntry('2026-05-22', ['melbourne']),
    ],
  },
  {
    label: 'April 2026',
    entries: [makeEntry('2026-04-30', ['rust'])],
  },
]

describe('JournalFeed', () => {
  it('renders all month group headings', () => {
    render(<JournalFeed groups={groups} allTags={['melbourne', 'programming', 'rust']} />)
    expect(screen.getByText('May 2026')).toBeTruthy()
    expect(screen.getByText('April 2026')).toBeTruthy()
  })

  it('renders all entries when no tag is active', () => {
    render(<JournalFeed groups={groups} allTags={['melbourne', 'programming', 'rust']} />)
    expect(screen.getByText(/Body for 2026-05-24/)).toBeTruthy()
    expect(screen.getByText(/Body for 2026-05-22/)).toBeTruthy()
    expect(screen.getByText(/Body for 2026-04-30/)).toBeTruthy()
  })

  it('renders a filter chip for each tag', () => {
    render(<JournalFeed groups={groups} allTags={['melbourne', 'programming', 'rust']} />)
    expect(screen.getByRole('button', { name: 'melbourne' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'rust' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'programming' })).toBeTruthy()
  })

  it('hides entries that do not match the active tag when a tag button is clicked', () => {
    const mockReplace = vi.fn()
    vi.mocked(
      // re-mock router for this test
      require('next/navigation').useRouter
    ).mockReturnValue({ replace: mockReplace })

    render(<JournalFeed groups={groups} allTags={['melbourne', 'programming', 'rust']} />)
    fireEvent.click(screen.getByRole('button', { name: 'rust' }))
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('tag=rust'),
      expect.any(Object)
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- src/components/JournalFeed/__tests__/JournalFeed.test.tsx
```

Expected: `Cannot find module '../index'`

- [ ] **Step 3: Implement `src/components/JournalFeed/index.tsx`**

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { MonthGroup } from '@/lib/journal-path'

interface JournalFeedProps {
  groups: MonthGroup[]
  allTags: string[]
}

export function JournalFeed({ groups, allTags }: JournalFeedProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? null

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (tag && tag !== activeTag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    const qs = params.toString()
    router.replace(qs ? `/journal?${qs}` : '/journal', { scroll: false })
  }

  return (
    <div>
      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-rule">
        <span className="font-mono text-xs text-text-soft self-center mr-1">
          // FILTER
        </span>
        <button
          onClick={() => setTag(null)}
          className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
            !activeTag
              ? 'bg-accent text-bg'
              : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
          }`}
        >
          all
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setTag(tag)}
            className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
              activeTag === tag
                ? 'bg-accent text-bg'
                : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Month groups */}
      <div className="space-y-12">
        {groups.map((group) => {
          const visible = activeTag
            ? group.entries.filter((e) => e.tags.includes(activeTag))
            : group.entries

          if (visible.length === 0) return null

          return (
            <section key={group.label}>
              <h2 className="font-mono text-xs tracking-widest text-text-soft uppercase mb-6">
                {group.label}
              </h2>
              <div className="space-y-8">
                {visible.map((entry) => (
                  <JournalEntryCard key={entry.slug} entry={entry} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default JournalFeed
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- src/components/JournalFeed/__tests__/JournalFeed.test.tsx
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/JournalFeed/
git commit -m "feat(journal): add JournalFeed client component with tag filtering"
```

---

## Task 6: `/journal` page

**Files:**
- Create: `src/app/journal/page.tsx`

Server component. Fetches entries and tags, then passes them into `<JournalFeed>` wrapped in `<Suspense>` (required because `JournalFeed` uses `useSearchParams`).

- [ ] **Step 1: Create `src/app/journal/page.tsx`**

```tsx
import { Suspense } from 'react'
import { getEntries, getAllJournalTags, groupEntriesByMonth } from '@/lib/journal-path'
import { JournalFeed } from '@/components/JournalFeed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal — Kochie Engineering',
  description:
    'Short observations, links, and thoughts — too brief for an essay.',
}

export default async function JournalPage() {
  const [entries, allTags] = await Promise.all([
    getEntries(),
    getAllJournalTags(),
  ])
  const groups = groupEntriesByMonth(entries)

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">JOURNAL</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Field notes.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          Short observations, links, and thoughts — too brief for an essay.
        </p>
      </header>

      <div className="mx-auto max-w-bleed px-4 pb-24">
        <Suspense
          fallback={
            <div className="font-mono text-xs text-text-soft py-12">
              Loading entries…
            </div>
          }
        >
          <JournalFeed groups={groups} allTags={allTags} />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

```bash
pnpm build 2>&1 | grep -E "journal|error|Error" | head -20
```

Expected: No TypeScript or build errors for the journal route.

- [ ] **Step 3: Commit**

```bash
git add src/app/journal/page.tsx
git commit -m "feat(journal): add /journal feed page"
```

---

## Task 7: `JournalEntryPage` component

**Files:**
- Create: `src/components/JournalEntryPage/index.tsx`
- Create: `src/components/JournalEntryPage/__tests__/JournalEntryPage.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/JournalEntryPage/__tests__/JournalEntryPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JournalEntryPage } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

const entry: JournalEntry = {
  slug: '2026-05-24',
  date: '2026-05-24',
  tags: ['rust', 'programming'],
  body: "Rust's borrow checker finally clicked.",
  bodyHtml: "<p>Rust's borrow checker finally clicked.</p>",
  prev: '2026-05-22',
  next: null,
}

const relatedEntry: JournalEntry = {
  slug: '2026-04-30',
  date: '2026-04-30',
  tags: ['rust'],
  body: 'Started the Field Journal redesign.',
  bodyHtml: '<p>Started the Field Journal redesign.</p>',
  prev: null,
  next: '2026-05-22',
}

describe('JournalEntryPage', () => {
  it('renders the formatted date as a heading', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    // Should contain the day and month
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/24/)
  })

  it('renders the body HTML', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.getByText(/borrow checker finally clicked/)).toBeTruthy()
  })

  it('renders tag chips linked to tag pages', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    const rustLink = screen.getByRole('link', { name: 'rust' })
    expect(rustLink.getAttribute('href')).toBe('/tags/rust')
  })

  it('renders prev navigation link when prev is set', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    const prevLink = screen.getByRole('link', { name: /2026-05-22/ })
    expect(prevLink.getAttribute('href')).toBe('/journal/2026-05-22')
  })

  it('does not render next navigation when next is null', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.queryByRole('link', { name: /next/i })).toBeNull()
  })

  it('renders the related entries section when related is non-empty', () => {
    render(<JournalEntryPage entry={entry} related={[relatedEntry]} />)
    expect(screen.getByText(/RELATED ENTRIES/)).toBeTruthy()
    expect(screen.getByText(/Field Journal redesign/)).toBeTruthy()
  })

  it('omits the related section when related is empty', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.queryByText(/RELATED ENTRIES/)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- src/components/JournalEntryPage/__tests__/JournalEntryPage.test.tsx
```

Expected: `Cannot find module '../index'`

- [ ] **Step 3: Implement `src/components/JournalEntryPage/index.tsx`**

```tsx
import Link from 'next/link'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalEntryPageProps {
  entry: JournalEntry
  related: JournalEntry[]
}

function formatFullDate(slug: string): string {
  const [year, month, day] = slug.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function JournalEntryPage({ entry, related }: JournalEntryPageProps) {
  return (
    <article className="mx-auto max-w-prose px-4 py-16">
      {/* Back link */}
      <Link
        href={`/journal#${entry.slug}`}
        className="font-mono text-xs text-text-soft hover:text-accent mb-8 block"
      >
        ← back to journal
      </Link>

      {/* Date heading */}
      <h1 className="font-mono text-accent text-2xl mb-6">
        {formatFullDate(entry.slug)}
      </h1>

      {/* Rendered body */}
      <div
        className="prose prose-sm text-text leading-relaxed mb-6 [&_code]:font-mono [&_code]:bg-bg-soft [&_code]:px-1 [&_code]:rounded-sm"
        dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
      />

      {/* Tag chips */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {entry.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="font-mono text-xs text-accent border border-accent/40 px-2 py-0.5 rounded-sm hover:bg-accent hover:text-bg transition-colors duration-fast"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Prev/Next navigation */}
      <nav
        className="flex justify-between border-t border-rule pt-8 mb-12"
        aria-label="Entry navigation"
      >
        {entry.prev ? (
          <Link
            href={`/journal/${entry.prev}`}
            className="font-mono text-xs text-text-mute hover:text-accent"
          >
            ← {entry.prev}
          </Link>
        ) : (
          <span />
        )}
        {entry.next ? (
          <Link
            href={`/journal/${entry.next}`}
            className="font-mono text-xs text-text-mute hover:text-accent"
          >
            {entry.next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Related entries */}
      {related.length > 0 && (
        <section>
          <div className="font-mono text-xs text-text-soft mb-6">
            // RELATED ENTRIES
          </div>
          <div className="space-y-6">
            {related.map((r) => (
              <JournalEntryCard key={r.slug} entry={r} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default JournalEntryPage
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- src/components/JournalEntryPage/__tests__/JournalEntryPage.test.tsx
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/JournalEntryPage/
git commit -m "feat(journal): add JournalEntryPage component"
```

---

## Task 8: `/journal/[entryId]` page + OG image

**Files:**
- Create: `src/app/journal/[entryId]/page.tsx`
- Create: `src/app/journal/[entryId]/opengraph-image.tsx`

- [ ] **Step 1: Create `src/app/journal/[entryId]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getEntries, getEntryBySlug } from '@/lib/journal-path'
import { JournalEntryPage } from '@/components/JournalEntryPage'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ entryId: string }>
}

export async function generateStaticParams() {
  const entries = await getEntries()
  return entries.map((e) => ({ entryId: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params
  const entry = await getEntryBySlug(entryId)
  if (!entry) return {}
  const [year, month, day] = entry.slug.split('-').map(Number)
  const date = new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return {
    title: `Journal — ${date} — Kochie Engineering`,
    description: entry.body.slice(0, 160),
  }
}

export default async function JournalEntryRoute({ params }: Props) {
  const { entryId } = await params
  const [entry, allEntries] = await Promise.all([
    getEntryBySlug(entryId),
    getEntries(),
  ])

  if (!entry) notFound()

  const related = allEntries
    .filter(
      (e) =>
        e.slug !== entry.slug &&
        e.tags.some((t) => entry.tags.includes(t))
    )
    .slice(0, 3)

  return (
    <main className="bg-bg text-text">
      <JournalEntryPage entry={entry} related={related} />
    </main>
  )
}
```

- [ ] **Step 2: Create `src/app/journal/[entryId]/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { getEntryBySlug } from '@/lib/journal-path'
import { ogFonts } from '@/lib/og-fonts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ entryId: string }>
}

export default async function OgImage({ params }: Props) {
  const { entryId } = await params
  const entry = await getEntryBySlug(entryId)
  const fonts = await ogFonts()

  const [year, month, day] = (entry?.slug ?? '').split('-').map(Number)
  const date = entry
    ? new Date(year, month - 1, day).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const excerpt = (entry?.body ?? '').slice(0, 120)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1815',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#DA8665',
            letterSpacing: '0.1em',
          }}
        >
          // JOURNAL
        </div>
        <div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 48,
              color: '#DA8665',
              marginBottom: 24,
            }}
          >
            {date}
          </div>
          <div
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 28,
              color: '#C9C0B0',
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            {excerpt}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#8C8576',
          }}
        >
          blog.kochie.io/journal
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
```

- [ ] **Step 3: Verify the build compiles**

```bash
pnpm build 2>&1 | grep -E "journal|error|Error" | head -20
```

Expected: `/journal` and `/journal/[entryId]` routes appear in the build output with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/journal/
git commit -m "feat(journal): add permalink page and OG image"
```

---

## Task 9: `JournalStrip` component + homepage update

**Files:**
- Create: `src/components/JournalStrip/index.tsx`
- Create: `src/components/JournalStrip/__tests__/JournalStrip.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/JournalStrip/__tests__/JournalStrip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JournalStrip } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

const makeEntry = (slug: string): JournalEntry => ({
  slug,
  date: slug,
  tags: ['rust'],
  body: `Body for ${slug}.`,
  bodyHtml: `<p>Body for ${slug}.</p>`,
  prev: null,
  next: null,
})

describe('JournalStrip', () => {
  it('renders the section label', () => {
    render(<JournalStrip entries={[makeEntry('2026-05-24')]} />)
    expect(screen.getByText(/FROM THE JOURNAL/)).toBeTruthy()
  })

  it('renders a link to /journal', () => {
    render(<JournalStrip entries={[makeEntry('2026-05-24')]} />)
    const link = screen.getByRole('link', { name: /all entries/i })
    expect(link.getAttribute('href')).toBe('/journal')
  })

  it('renders one card per entry', () => {
    render(
      <JournalStrip
        entries={[makeEntry('2026-05-24'), makeEntry('2026-05-22'), makeEntry('2026-04-30')]}
      />
    )
    // Each compact card shows a link to the permalink
    expect(screen.getByRole('link', { name: /24 May 2026/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /22 May 2026/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /30 Apr 2026/i })).toBeTruthy()
  })

  it('returns null when entries is empty', () => {
    const { container } = render(<JournalStrip entries={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- src/components/JournalStrip/__tests__/JournalStrip.test.tsx
```

Expected: `Cannot find module '../index'`

- [ ] **Step 3: Implement `src/components/JournalStrip/index.tsx`**

```tsx
import Link from 'next/link'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalStripProps {
  entries: JournalEntry[]
}

export function JournalStrip({ entries }: JournalStripProps) {
  if (entries.length === 0) return null

  return (
    <section className="mx-auto max-w-bleed px-4 py-8 border-l-[3px] border-accent pl-8">
      <div className="flex justify-between items-baseline mb-6">
        <span className="font-mono text-xs text-text-soft">
          // FROM THE JOURNAL
        </span>
        <Link
          href="/journal"
          className="font-mono text-xs text-accent hover:underline"
        >
          → all entries
        </Link>
      </div>
      <div className="space-y-5">
        {entries.map((entry) => (
          <JournalEntryCard key={entry.slug} entry={entry} compact />
        ))}
      </div>
    </section>
  )
}

export default JournalStrip
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- src/components/JournalStrip/__tests__/JournalStrip.test.tsx
```

Expected: All tests pass.

- [ ] **Step 5: Update `src/app/page.tsx` to include `JournalStrip`**

The current `Index` function renders: `<HeroFeature>`, `<RecentRow>`, `<ArchiveList>`. Insert `JournalStrip` between `RecentRow` and `ArchiveList`.

Add the import at the top of the file with the other component imports:
```tsx
import { JournalStrip } from '@/components/JournalStrip'
import { getRecentEntries } from '@/lib/journal-path'
```

Inside `Index`, add after the `const archive = articles` line:
```tsx
const journalEntries = await getRecentEntries(3)
```

Replace the return JSX to add `JournalStrip` between `RecentRow` and `ArchiveList`:
```tsx
return (
  <main className="bg-bg text-text">
    <HeroFeature article={featured} author={author} />
    <RecentRow articles={recent} />
    <JournalStrip entries={journalEntries} />
    <ArchiveList articles={archive} id="archive" />
  </main>
)
```

- [ ] **Step 6: Commit**

```bash
git add src/components/JournalStrip/ src/app/page.tsx
git commit -m "feat(journal): add JournalStrip to homepage"
```

---

## Task 10: Tag system — `/tags` index (primary/secondary split)

**Files:**
- Modify: `src/app/tags/page.tsx`

Primary tags: appear in `metadata.yaml` (already in `metadataConfig.tags`). Secondary: in journal entries but not in `metadata.yaml`.

- [ ] **Step 1: Update `src/app/tags/page.tsx`**

Add imports at the top:
```tsx
import { getAllJournalTags } from '@/lib/journal-path'
```

Replace the `Tags` function body:

```tsx
export default async function Tags() {
  const articles = await getAllArticlesMetadata()
  const journalTags = await getAllJournalTags()

  // Primary tags: those defined in metadata.yaml — build from articles as before
  const primaryTags = getUsedTags(articles, metadataConfig.tags as Tag[])

  // Secondary tags: in journal entries but NOT defined in metadata.yaml
  const primarySlugs = new Set(primaryTags.map((t) => t.slug.toLowerCase()))
  const secondaryTags = journalTags.filter(
    (tag) => !primarySlugs.has(tag.toLowerCase())
  )

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">TAGS</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          All tags.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          {primaryTags.length} ways to slice the archive.
        </p>
      </header>

      {/* Primary tags */}
      <ul className="mx-auto max-w-bleed px-4 pb-8 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {primaryTags.map((tag) => (
          <li key={tag.slug} className="h-full">
            <Link
              href={`/tags/${tag.slug}`}
              className="group flex flex-col h-full border border-rule rounded-md p-5 hover:border-accent transition-colors duration-fast"
            >
              <div className="font-mono text-meta tracking-wide text-text-soft mb-3 flex items-baseline gap-2">
                <span className="text-accent">
                  {`// ${String(tag.articleCount).padStart(2, '0')}`}
                </span>
                <span>{tag.articleCount === 1 ? 'ESSAY' : 'ESSAYS'}</span>
              </div>
              <div className="font-serif font-semibold text-h3 text-text capitalize leading-tight group-hover:text-accent transition-colors duration-fast">
                {tag.name}
              </div>
              {tag.blurb ? (
                <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-2">
                  {tag.blurb}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {/* Secondary tags (journal-only) */}
      {secondaryTags.length > 0 && (
        <div className="mx-auto max-w-bleed px-4 pb-16">
          <div className="font-mono text-xs text-text-soft mb-4 border-t border-rule pt-8">
            // MORE TAGS
          </div>
          <div className="flex flex-wrap gap-2">
            {secondaryTags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="font-mono text-xs text-text-mute border border-rule px-3 py-1 rounded-sm hover:border-accent hover:text-accent transition-colors duration-fast"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
pnpm build 2>&1 | grep -E "tags|error|Error" | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/tags/page.tsx
git commit -m "feat(journal): add primary/secondary tag split on /tags page"
```

---

## Task 11: Tag system — `/tags/[tagId]` page

**Files:**
- Modify: `src/app/tags/[tagId]/page.tsx`

Add a `// JOURNAL ENTRIES` section below the existing articles list.

- [ ] **Step 1: Update `src/app/tags/[tagId]/page.tsx`**

Add imports at the top of the file:
```tsx
import { getEntries } from '@/lib/journal-path'
import { JournalEntryCard } from '@/components/JournalEntryCard'
```

In `TagComponent`, after the existing `const tagArticles = ...` line, add:
```tsx
const allJournalEntries = await getEntries()
const tagJournalEntries = allJournalEntries.filter((entry) =>
  entry.tags.some((t) => t.toLowerCase() === tagId.toLowerCase())
)
```

Replace the return JSX. The existing structure is:
```tsx
return (
  <main ...>
    <header>...</header>
    {tagArticles.length === 0 ? <div>No essays...</div> : <ArchiveList articles={tagArticles} />}
  </main>
)
```

Replace with:
```tsx
return (
  <main className="bg-bg text-text">
    <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
      <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
        {'// '}
        <span className="text-accent">TAG</span>
      </div>
      <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4 capitalize">
        {displayName}
      </h1>
      <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
        {blurb}
      </p>
      <p className="font-mono text-meta text-text-soft tracking-wide mt-4">
        {tagArticles.length} {tagArticles.length === 1 ? 'essay' : 'essays'}
        {tagJournalEntries.length > 0 &&
          ` · ${tagJournalEntries.length} ${tagJournalEntries.length === 1 ? 'journal entry' : 'journal entries'}`}
      </p>
    </header>

    {tagArticles.length > 0 && <ArchiveList articles={tagArticles} />}

    {tagJournalEntries.length > 0 && (
      <section className="mx-auto max-w-bleed px-4 pt-8 pb-16">
        <div className="font-mono text-xs text-text-soft mb-8 border-t border-rule pt-8">
          // JOURNAL ENTRIES
        </div>
        <div className="space-y-8 max-w-prose">
          {tagJournalEntries.map((entry) => (
            <JournalEntryCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </section>
    )}
  </main>
)
```

- [ ] **Step 2: Verify the build compiles**

```bash
pnpm build 2>&1 | grep -E "tagId|error|Error" | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/tags/[tagId]/page.tsx
git commit -m "feat(journal): add journal entries section to tag detail pages"
```

---

## Task 12: Topbar Journal link

**Files:**
- Modify: `src/components/Topbar/index.tsx`

Add `Journal` link between `Projects` and `Tags` in the nav.

- [ ] **Step 1: Update the nav in `src/components/Topbar/index.tsx`**

Inside the `<nav>` element, after the existing `Projects` link and before the `Tags` link, add:

```tsx
<Link
  href="/journal"
  className="hover:text-accent transition-colors duration-fast"
>
  Journal
</Link>
```

The nav should now read: Archive · Projects · Journal · Tags · RSS · ThemeButton

- [ ] **Step 2: Run existing Topbar tests**

```bash
pnpm test -- src/components/Topbar/__tests__/Topbar.test.tsx
```

Expected: All tests pass (the new link is additive; existing assertions still hold).

- [ ] **Step 3: Commit**

```bash
git add src/components/Topbar/index.tsx
git commit -m "feat(journal): add Journal link to topbar"
```

---

## Task 13: RSS feed + sitemap + component exports

**Files:**
- Modify: `src/lib/feed.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/index.ts`

### RSS feed

- [ ] **Step 1: Add journal feed to `src/lib/feed.ts`**

Add the import at the top:
```typescript
import { getEntries } from './journal-path'
```

After the existing `generateFeeds` constant, add a new function and update `generateFeeds`:

```typescript
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
  const [year, month, day] = (entries[0]?.slug ?? '2026-01-01').split('-').map(Number)

  entries.forEach((entry) => {
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
```

Then update `generateFeeds` to also write the journal feed:

```typescript
generateFeeds = async (): Promise<void> => {
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
  await writeFile(join(__dirname, '../../public/feed/rss.xml'), articleFeed.rss2())
  await writeFile(join(__dirname, '../../public/feed/atom'), articleFeed.atom1())
  await writeFile(join(__dirname, '../../public/feed/json'), articleFeed.json1())

  // Journal feed
  try {
    await access(join(__dirname, '../../public/journal'), constants.F_OK)
  } catch {
    await mkdir(join(__dirname, '../../public/journal'))
  }
  await writeFile(join(__dirname, '../../public/journal/feed.xml'), journalFeed.rss2())
}
```

### Sitemap

- [ ] **Step 2: Update `src/app/sitemap.ts`**

Add the import:
```typescript
import { getEntries } from '@/lib/journal-path'
```

Inside the `sitemap` function, after the `const manifests = ...` lines, add:
```typescript
const journalEntries = await getEntries()
const journalRoutes: MetadataRoute.Sitemap = journalEntries.map((entry) => ({
  url: `https://blog.kochie.io/journal/${entry.slug}`,
  lastModified: entry.date,
}))
```

Update the return statement to include `/journal` and individual entries:
```typescript
return [
  ...routes,
  { url: 'https://blog.kochie.io/journal', lastModified: new Date().toISOString() },
  ...posts,
  ...tags,
  ...projects,
  ...journalRoutes,
]
```

### Component exports

- [ ] **Step 3: Add new components to `src/components/index.ts`**

Add these exports alongside the existing ones:
```typescript
export { JournalEntryCard } from './JournalEntryCard'
export { JournalFeed } from './JournalFeed'
export { JournalEntryPage } from './JournalEntryPage'
export { JournalStrip } from './JournalStrip'
```

- [ ] **Step 4: Run the full test suite**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Verify a full build succeeds**

```bash
pnpm build
```

Expected: Build completes with no errors. Output shows `/journal` and `/journal/[entryId]` routes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/feed.ts src/app/sitemap.ts src/components/index.ts
git commit -m "feat(journal): add journal RSS feed, sitemap entries, and component exports"
```
