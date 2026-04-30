# Field Journal · Phase 4: Homepage Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current homepage (full-screen PCB-jumbotron + Gallery cards) with the Field Journal homepage from spec §9.1: a hero feature at the top, a 3-card row of recent essays, and a year-grouped numbered archive list. Add a `featured: boolean` frontmatter flag so the hero is curatorially controllable, defaulting to most-recent.

**Architecture:**
- Three new components — `HeroFeature`, `RecentRow`, `ArchiveList` — under `src/components/`.
- Frontmatter gains an optional `featured: boolean` field; `ArticleMetadata` exposes it as `featured?: boolean`. Both `getArticleMatter` and `getArticleMetadata` read it.
- The homepage (`src/app/page.tsx`) loads all article metadata, picks the featured (frontmatter-flagged or fallback to index 0), the next 3 by date for the recent row, and passes the full sorted list to ArchiveList.
- `Gallery` and `Jumbotron` components stay in the codebase (they may have other consumers and are non-blocking) but are removed from the homepage. Phase 6 cleanup will retire them properly.
- The hero figure on `HeroFeature` and thumbnails on `RecentRow` cards reuse the article's `jumbotron` image. Articles without a jumbotron get a typographic fallback (mono article number against `bg-bg-deep`).

**Tech Stack:** React 19 · Next.js 16 App Router · `next/image` · `next/link` · Tailwind 4 (Phase 1 tokens, Phase 2 figure system, Phase 3 reading scaffolding all available) · Vitest 4 + RTL.

**Reference:** Spec §9.1 (homepage architecture) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation`.

---

## File Structure

**New files:**
- `src/components/HeroFeature/index.tsx` — top-of-homepage feature card.
- `src/components/HeroFeature/__tests__/HeroFeature.test.tsx`
- `src/components/RecentRow/index.tsx` — 3-card recent-essays row.
- `src/components/RecentRow/__tests__/RecentRow.test.tsx`
- `src/components/ArchiveList/index.tsx` — year-grouped numbered list.
- `src/components/ArchiveList/__tests__/ArchiveList.test.tsx`

**Modified files:**
- `src/lib/article-path.ts` — add `featured?: boolean` to `ArticleMetadata` and surface it in both metadata getters.
- `src/app/page.tsx` — replace Jumbotron + Gallery with the new homepage composition.
- `src/components/index.ts` — re-export the three new components.

**Files NOT changed in Phase 4:**
- `Jumbotron`, `Gallery`, `ArticleCards` — left in the codebase (potential cleanup in Phase 6).
- The article page, the article components, the figure system — all stay.
- Topbar / Footer / Theme button — Phase 6.
- Tag pages, /archive standalone page — Phase 5.

---

## Task 1: Add `featured` frontmatter support

**Files:**
- Modify: `src/lib/article-path.ts`

- [ ] **Step 1: Read the current `ArticleMetadata` interface and the two metadata getters**

Confirm the shape:
- `ArticleMetadata` interface has fields like `author`, `tags`, `keywords`, `readTime`, `articleDir`, `publishedDate`, `editedDate`, `title`, `blurb`, `jumbotron` etc.
- `getArticleMatter` (sync) and `getArticleMetadata` (async) both build `ArticleMetadata` from frontmatter (`file.data.*`).

- [ ] **Step 2: Update the `ArticleMetadata` interface**

Add a new optional field:

```ts
export interface ArticleMetadata {
  // ...existing fields...
  featured?: boolean
}
```

- [ ] **Step 3: Read `featured` in `getArticleMatter`**

In the existing `getArticleMatter` function, when constructing the returned object, add:

```ts
featured: file.data.featured === true,
```

(Use strict equality so a `featured: false` or missing field both resolve to `false`. Strings like `'true'` from YAML should not coerce — readers can rely on the typed boolean.)

- [ ] **Step 4: Read `featured` in `getArticleMetadata`**

Mirror the same line in `getArticleMetadata`'s returned object.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: pass. The new field is optional and existing articles default to `featured: false`, which is functionally identical to no field.

If a test asserts on the shape of `ArticleMetadata` (e.g., `expect(metadata).toEqual({...})` without partial match), it may fail because the new `featured: false` field is now present. Update to use `expect.objectContaining` or partial match if needed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/article-path.ts
git commit -m "add optional featured frontmatter flag to ArticleMetadata"
```

---

## Task 2: Build `HeroFeature`

**Files:**
- Create: `src/components/HeroFeature/index.tsx`
- Create: `src/components/HeroFeature/__tests__/HeroFeature.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import HeroFeature from '../index'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'

afterEach(cleanup)

const fixArticle = (over: Partial<ArticleMetadata> = {}): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '/hero.jpg', alt: 'a hero', lqip: '' },
    tags: ['cdk', 'maths'],
    keywords: [],
    readTime: '10 min read',
    indexPath: '',
    articleDir: '13-lambda-recursion',
    publishedDate: '2025-08-01T00:00:00.000Z',
    editedDate: '2025-08-01T00:00:00.000Z',
    title: 'Stop writing recursive Lambdas.',
    blurb: 'A 10-minute tour of why a function that calls itself is the wrong shape for a serverless runtime.',
    ...over,
  }) as ArticleMetadata

const fixAuthor: Author = {
  username: 'kochie',
  fullName: 'Robert Koch',
  email: '',
  socialMedia: [],
  avatar: { src: '', lqip: '' },
  bio: '',
  fediverse: { creator: '' },
}

describe('HeroFeature', () => {
  it('renders the headline, deck, and read-the-essay CTA', () => {
    const { getByText, getByRole } = render(
      <HeroFeature article={fixArticle()} author={fixAuthor} />
    )
    expect(getByText('Stop writing recursive Lambdas.')).toBeTruthy()
    expect(getByText(/wrong shape for a serverless runtime/)).toBeTruthy()
    const cta = getByRole('link', { name: /read the essay/i })
    expect(cta.getAttribute('href')).toBe('/articles/13-lambda-recursion')
  })

  it('shows the article number in the kicker, padded to 2 digits', () => {
    const { container } = render(
      <HeroFeature article={fixArticle({ articleDir: '07-foo' })} author={fixAuthor} />
    )
    expect(container.textContent).toMatch(/\/\/\s*07/)
  })

  it('shows the byline and read time in the meta line', () => {
    const { container } = render(
      <HeroFeature article={fixArticle()} author={fixAuthor} />
    )
    expect(container.textContent).toMatch(/Robert Koch/)
    expect(container.textContent).toMatch(/10 MIN READ/)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- HeroFeature`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement HeroFeature**

```tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'

interface HeroFeatureProps {
  article: ArticleMetadata
  author: Author
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

/**
 * Top-of-homepage hero. Oversized serif headline, italic deck, mono kicker,
 * mono meta, clay-bordered "Read the essay →" CTA. Hero figure on the right
 * if the article has a jumbotron; typographic fallback otherwise.
 *
 * Spec §9.1 step 2: "1.4:1 grid; text on the left, figure on the right;
 * full-width on mobile."
 */
const HeroFeature = ({ article, author }: HeroFeatureProps): React.ReactElement => {
  const num = getNumber(article.articleDir)
  const tags = article.tags.slice(0, 3).map((t) => t.toUpperCase())
  return (
    <section className="mx-auto max-w-bleed px-4 py-16 grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 items-center">
      <div>
        <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
          <span className="text-signal mr-3">// THIS WEEK</span>
          {num !== null ? (
            <span className="text-accent mr-2">
              {'// '}
              {String(num).padStart(2, '0')}
            </span>
          ) : null}
          {tags.join(' · ')}
        </div>
        <h1 className="font-serif font-semibold text-display-hero text-text leading-none tracking-tight mb-5">
          {article.title}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-7 max-w-prose">
          {article.blurb}
        </p>
        <div className="font-mono text-meta text-text-soft tracking-wide mb-7 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-serif italic text-text">By {author.fullName}</span>
          <span aria-hidden>·</span>
          <span>{article.readTime.toUpperCase()}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(article.publishedDate)}</span>
        </div>
        <Link
          href={`/articles/${article.articleDir}`}
          className="inline-flex items-center gap-2 px-5 py-3 border border-accent rounded-md text-text font-serif italic text-base hover:bg-accent hover:text-bg transition-colors duration-fast"
        >
          Read the essay <span className="text-accent">→</span>
        </Link>
      </div>

      <div
        aria-hidden={!article.jumbotron?.alt}
        className="relative w-full bg-bg-deep border border-rule rounded-md overflow-hidden"
        style={{ aspectRatio: '4 / 3' }}
      >
        {article.jumbotron?.url ? (
          <Image
            src={article.jumbotron.url}
            alt={article.jumbotron.alt ?? ''}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            blurDataURL={article.jumbotron.lqip}
            placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
            style={{ objectFit: 'cover' }}
          />
        ) : num !== null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif font-semibold text-[10rem] text-accent leading-none">
              {String(num).padStart(2, '0')}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default HeroFeature
```

Notes:
- Number-extraction regex is inlined (the same approach as Phase 3's Article — keeps server-only `article-path` out of client bundles).
- Hero figure aspect 4:3 — generous but not full-bleed. The article-page hero uses 16:9; the homepage hero is taller because it shares the row with text.
- "Read the essay →" CTA: clay-bordered, fills with clay on hover, text inverts.
- Mobile collapses to single column.

- [ ] **Step 4: Run tests**

Run: `npm test -- HeroFeature`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroFeature/index.tsx \
  src/components/HeroFeature/__tests__/HeroFeature.test.tsx
git commit -m "add HeroFeature: oversized serif headline, mono kicker, clay CTA, jumbotron hero"
```

---

## Task 3: Build `RecentRow`

**Files:**
- Create: `src/components/RecentRow/index.tsx`
- Create: `src/components/RecentRow/__tests__/RecentRow.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import RecentRow from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: '',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '5 min',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('RecentRow', () => {
  it('renders one card per article', () => {
    const { container } = render(
      <RecentRow
        articles={[
          fix({ articleDir: '12-a', title: 'A' }),
          fix({ articleDir: '11-b', title: 'B' }),
          fix({ articleDir: '10-c', title: 'C' }),
        ]}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('/articles/12-a')
  })

  it('renders the article number prefix on each card', () => {
    const { container } = render(
      <RecentRow
        articles={[
          fix({ articleDir: '12-a', title: 'A' }),
          fix({ articleDir: '03-b', title: 'B' }),
        ]}
      />
    )
    expect(container.textContent).toMatch(/\/\/\s*12/)
    expect(container.textContent).toMatch(/\/\/\s*03/)
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<RecentRow articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- RecentRow`
Expected: FAIL.

- [ ] **Step 3: Implement RecentRow**

```tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMetadata } from '@/lib/article-path'

interface RecentRowProps {
  articles: ArticleMetadata[]
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatMonthYear = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

const Thumbnail = ({ article }: { article: ArticleMetadata }) => {
  const num = getNumber(article.articleDir)
  return (
    <div
      className="relative w-full bg-bg-deep border border-rule rounded-md overflow-hidden"
      style={{ aspectRatio: '16 / 10' }}
    >
      {article.jumbotron?.url ? (
        <Image
          src={article.jumbotron.url}
          alt={article.jumbotron.alt ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          blurDataURL={article.jumbotron.lqip}
          placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
          style={{ objectFit: 'cover' }}
        />
      ) : num !== null ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif font-semibold text-[6rem] text-accent leading-none">
            {String(num).padStart(2, '0')}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * 3-card recent-essays row. Each card: thumbnail / number / title / blurb /
 * meta. Pulls thumbnail from the article's jumbotron; falls back to a big
 * mono number against bg-bg-deep when there's no jumbotron.
 *
 * Spec §9.1 step 3.
 */
const RecentRow = ({ articles }: RecentRowProps): React.ReactElement | null => {
  if (articles.length === 0) return null
  return (
    <section className="mx-auto max-w-bleed px-4 py-12">
      <div className="flex items-baseline justify-between mb-6 font-mono text-meta tracking-wide">
        <span className="text-text-soft">
          {'// '}
          <span className="text-accent">RECENT</span>
          {' · also worth your time'}
        </span>
        <Link
          href="#archive"
          className="font-serif italic text-text-mute hover:text-accent transition-colors duration-fast"
        >
          See the archive →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const num = getNumber(article.articleDir)
          return (
            <Link
              key={article.articleDir}
              href={`/articles/${article.articleDir}`}
              className="group block"
            >
              <Thumbnail article={article} />
              <div className="mt-3 font-mono text-meta text-accent tracking-wide">
                {num !== null ? `// ${String(num).padStart(2, '0')}` : ''}
              </div>
              <h3 className="font-serif font-semibold text-h3 text-text leading-tight mt-1 group-hover:text-accent transition-colors duration-fast">
                {article.title}
              </h3>
              <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-2 line-clamp-3">
                {article.blurb}
              </p>
              <div className="font-mono text-meta text-text-soft tracking-wide mt-3">
                {article.readTime.toUpperCase()} · {formatMonthYear(article.publishedDate)}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default RecentRow
```

- [ ] **Step 4: Run tests**

Run: `npm test -- RecentRow`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/RecentRow/index.tsx \
  src/components/RecentRow/__tests__/RecentRow.test.tsx
git commit -m "add RecentRow: three-card recent-essays row"
```

---

## Task 4: Build `ArchiveList`

**Files:**
- Create: `src/components/ArchiveList/index.tsx`
- Create: `src/components/ArchiveList/__tests__/ArchiveList.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ArchiveList from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: '',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '5 min',
    indexPath: '',
    articleDir: '',
    publishedDate: '',
    editedDate: '',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('ArchiveList', () => {
  it('groups rows under year headers', () => {
    const { container } = render(
      <ArchiveList
        articles={[
          fix({
            articleDir: '13-third',
            title: '2025 third',
            publishedDate: '2025-03-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '12-second',
            title: '2024 second',
            publishedDate: '2024-12-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '11-first',
            title: '2024 first',
            publishedDate: '2024-06-01T00:00:00.000Z',
          }),
        ]}
      />
    )
    const yearLabels = container.querySelectorAll('[data-year]')
    expect(Array.from(yearLabels).map((y) => y.getAttribute('data-year'))).toEqual([
      '2025',
      '2024',
    ])
  })

  it('renders a row per article with title and link', () => {
    const { container } = render(
      <ArchiveList
        articles={[
          fix({
            articleDir: '13-x',
            title: 'X',
            publishedDate: '2025-03-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '12-y',
            title: 'Y',
            publishedDate: '2024-12-01T00:00:00.000Z',
          }),
        ]}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('/articles/13-x')
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<ArchiveList articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- ArchiveList`
Expected: FAIL.

- [ ] **Step 3: Implement ArchiveList**

```tsx
import React from 'react'
import Link from 'next/link'
import type { ArticleMetadata } from '@/lib/article-path'

interface ArchiveListProps {
  articles: ArticleMetadata[]
  /**
   * Optional id for the section element. Used to anchor "See the archive →"
   * links from above.
   */
  id?: string
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatMonthYear = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

interface YearGroup {
  year: string
  articles: ArticleMetadata[]
}

const groupByYear = (articles: ArticleMetadata[]): YearGroup[] => {
  const groups = new Map<string, ArticleMetadata[]>()
  for (const article of articles) {
    const year = String(new Date(article.publishedDate).getFullYear())
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(article)
  }
  // Map preserves insertion order; since input is sorted desc, years are too.
  return Array.from(groups.entries()).map(([year, group]) => ({
    year,
    articles: group,
  }))
}

/**
 * Year-grouped numbered archive list. Each row: number / title + blurb /
 * tags / read-time + date. Used on the homepage and (in Phase 5) on the
 * standalone /archive page.
 *
 * Spec §9.1 step 4 and §9.3.
 */
const ArchiveList = ({
  articles,
  id = 'archive',
}: ArchiveListProps): React.ReactElement | null => {
  if (articles.length === 0) return null
  const groups = groupByYear(articles)
  return (
    <section id={id} className="mx-auto max-w-bleed px-4 py-12">
      <div className="font-mono text-meta tracking-wide text-text-soft mb-6">
        {'// '}
        <span className="text-accent">ARCHIVE</span>
        {' · all essays, by year'}
      </div>
      {groups.map((group) => (
        <div key={group.year} data-year={group.year} className="mb-10">
          <div className="font-mono text-meta tracking-wide text-text-soft mb-3 pb-2 border-b border-rule">
            {'// '}
            {group.year}
          </div>
          <ol className="list-none">
            {group.articles.map((article) => {
              const num = getNumber(article.articleDir)
              return (
                <li
                  key={article.articleDir}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_auto_auto] gap-4 items-baseline py-3 border-b border-rule/50 last:border-b-0"
                >
                  <span className="font-mono text-meta text-accent tracking-wide">
                    {num !== null ? `// ${String(num).padStart(2, '0')}` : ''}
                  </span>
                  <div>
                    <Link
                      href={`/articles/${article.articleDir}`}
                      className="font-serif font-semibold text-text hover:text-accent transition-colors duration-fast"
                    >
                      {article.title}
                    </Link>
                    {article.blurb ? (
                      <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-1">
                        {article.blurb}
                      </p>
                    ) : null}
                  </div>
                  <span className="font-mono text-meta text-text-soft tracking-wide hidden md:inline">
                    {article.tags.slice(0, 2).join(' · ')}
                  </span>
                  <span className="font-mono text-meta text-text-soft tracking-wide whitespace-nowrap">
                    {article.readTime.toUpperCase()} · {formatMonthYear(article.publishedDate)}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </section>
  )
}

export default ArchiveList
```

- [ ] **Step 4: Run tests**

Run: `npm test -- ArchiveList`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ArchiveList/index.tsx \
  src/components/ArchiveList/__tests__/ArchiveList.test.tsx
git commit -m "add ArchiveList: year-grouped numbered article index"
```

---

## Task 5: Update the homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the homepage body**

Replace the contents of `src/app/page.tsx` with:

```tsx
import React from 'react'
import { Metadata } from 'next'
import HeroFeature from '@/components/HeroFeature'
import RecentRow from '@/components/RecentRow'
import ArchiveList from '@/components/ArchiveList'
import { getAllArticlesMetadata, buildMetadata } from '@/lib/article-path'

export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'Kochie Engineering',
    title: 'Kochie Engineering / Blog',
    url: '/',
    locale: 'en-AU',
    description:
      'Field notes from a one-person engineering studio. Software, mostly. Sometimes maths.',
  },
}

export default async function Index() {
  const articles = await getAllArticlesMetadata()
  if (articles.length === 0) {
    return (
      <main className="mx-auto max-w-prose px-4 py-24 text-text">
        <p className="font-serif italic text-text-mute">
          No essays yet. Come back soon.
        </p>
      </main>
    )
  }

  // Pick the featured article: frontmatter-flagged, or fall back to most recent.
  const featured = articles.find((a) => a.featured) ?? articles[0]

  // Recent: the next 3 articles (excluding the featured one).
  const recent = articles
    .filter((a) => a.articleDir !== featured.articleDir)
    .slice(0, 3)

  // Archive: the full list.
  const archive = articles

  // Author lookup for the hero byline.
  const meta = await buildMetadata()
  const author =
    meta.authors?.[featured.author] ?? {
      username: featured.author,
      fullName: featured.author,
      email: '',
      socialMedia: [],
      avatar: { src: '', lqip: '' },
      bio: '',
      fediverse: { creator: '' },
    }

  return (
    <main className="bg-bg text-text">
      <HeroFeature article={featured} author={author} />
      <RecentRow articles={recent} />
      <ArchiveList articles={archive} id="archive" />
    </main>
  )
}
```

The PCB-jumbotron import (`import jumbotron from 'public/images/umberto-...jpg'`), the `next/image` import, and the `Gallery`/`Jumbotron` imports are gone.

- [ ] **Step 2: Run tests + build**

Run: `npm test`
Expected: pass.

Run: `npm run build`
Expected: build succeeds. The homepage renders with the new components.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "rewrite homepage to HeroFeature + RecentRow + ArchiveList"
```

---

## Task 6: Re-export the new components

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add re-exports**

Following the existing convention, add:

```ts
export { default as HeroFeature } from './HeroFeature'
export { default as RecentRow } from './RecentRow'
export { default as ArchiveList } from './ArchiveList'
```

- [ ] **Step 2: Verify**

Run: `npm test`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "re-export Phase 4 homepage components"
```

---

## Task 7: Smoke test on the homepage

**Files:**
- No changes — verification only.

- [ ] **Step 1: Run `npm test` and `npm run build`**

Both should pass cleanly.

- [ ] **Step 2: Run dev server and visit the homepage**

Run: `npm run dev`

Visit `http://localhost:3000`.

Visual / behaviour checks:
- HeroFeature: oversized serif headline matches the most recent article's title; italic deck below; mono kicker with `// THIS WEEK` and the article number; "Read the essay →" CTA links to that article; hero image on the right (or typographic fallback if no jumbotron).
- RecentRow: 3 cards under "// RECENT". Each card has a thumbnail, number, title, blurb, meta. Hovering a card highlights the title in clay.
- ArchiveList: year-grouped numbered list. Each year has a `// 2025` or similar header. Each row links to its article.
- ScrollProgress is NOT present on the homepage (it's article-only, lives inside the Article component).
- Body bg is warm soot (dark mode default). Toggle to light: cream paper. All three sections re-skin cleanly.
- No console errors.

If a check fails, capture precisely (URL, element, console message) and report — Phase 4 ends here; any follow-on fix is its own commit.

- [ ] **Step 3: Stop the dev server.**

- [ ] **Step 4: No commit needed for verification.**

---

## Phase 4 wrap-up

After Task 7 passes, Phase 4 is complete:
- Homepage replaces Jumbotron + Gallery with HeroFeature + RecentRow + ArchiveList.
- `featured: boolean` frontmatter flag wired in.
- Phase 5 (`/archive` standalone + tag pages) and Phase 6 (chrome restyle) follow.

**Suggested squashed PR commit message** (when the redesign branch eventually lands):

```
Field Journal · Phase 4: homepage redesign

- HeroFeature component: oversized serif headline, mono kicker, italic deck, clay-bordered CTA, hero figure on the right
- RecentRow: 3-card row of recent essays with thumbnails and meta
- ArchiveList: year-grouped numbered article index with id-anchor for in-page links
- featured: boolean frontmatter flag selects the homepage hero (defaults to most recent)
- Homepage replaces Jumbotron + Gallery composition

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §9.1
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-4-homepage.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 4 covers spec §9.1 entirely (HeroFeature, RecentRow, ArchiveList, featured flag). It does not cover §9.3 (`/archive` standalone — Phase 5), §9.4 (tag pages — Phase 5), §9.1 chrome (topbar / footer — Phase 6).

**Placeholder scan** — No TBD/TODO. The "register Sidenote" pattern from Phase 3 is matched here for consistency in re-exports. Snapshot regeneration guidance is concrete.

**Type consistency** — `featured?: boolean` added to `ArticleMetadata` and read by both metadata getters consistently. `HeroFeature` accepts the full `ArticleMetadata` and an `Author`; `RecentRow` and `ArchiveList` accept just article arrays (no author lookup needed at the card level — bylines aren't shown on cards).

**Scope check** — 7 tasks, each TDD-driven. Largest single task is the homepage update (Task 5) but it's primarily wiring; the new components do the work.

**Open follow-ups (deferred to Phase 4.5 or later):**
- Article-without-jumbotron typographic fallback uses an arbitrary 10rem / 6rem size. Could be tuned visually during Phase 4 smoke test or in a follow-up.
- The "See the archive →" link in RecentRow is an in-page anchor (`#archive`) for Phase 4. Phase 5 will redirect it to `/archive` when the standalone page exists.
- Featured-article mechanism is now functional; the user can experiment by adding `featured: true` to one article's frontmatter to see the override take effect.
