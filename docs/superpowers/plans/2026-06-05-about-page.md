# /about Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a focused `/about` page with author bio, a weekly article publication heatmap (2021–present), writing themes, hand-picked featured articles, and recent articles — establishing E-E-A-T signals via `ProfilePage` JSON-LD.

**Architecture:** Pure server component page; all data from two calls (`buildMetadata()` + `getAllArticlesMetadata()`). ISO week heatmap computation extracted to a testable utility in `src/lib/date-utils.ts`. No new shared components — inline JSX following existing page patterns.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vitest (tests), `src/lib/article-path.ts` data layer, `src/lib/og-template.tsx` + `src/lib/og-fonts.ts` for OG image.

**Spec:** `docs/superpowers/specs/2026-06-05-about-page-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `types/metadata.d.ts` | Add `about?` key to `Metadata` type |
| Modify | `metadata.yaml` | Add `about.featuredArticles` array |
| Create | `src/lib/date-utils.ts` | `isoWeek()` + `buildHeatmapGrid()` helpers |
| Create | `src/lib/__tests__/date-utils.test.ts` | Unit tests for heatmap logic |
| Create | `src/app/about/page.tsx` | Full about page server component |
| Create | `src/app/about/opengraph-image.tsx` | OG image for `/about` |
| Modify | `src/app/sitemap.ts` | Add `/about` route |
| Modify | `src/app/articles/[articleId]/page.tsx` | Add `authors.url` pointing to `/about` |

---

## Task 1: Extend types and seed featured articles data

**Files:**
- Modify: `types/metadata.d.ts`
- Modify: `metadata.yaml`

- [ ] **Step 1.1: Add `about` key to `Metadata` type**

Open `types/metadata.d.ts`. The current `Metadata` type ends at line 40:

```ts
export type Metadata = {
  authors: Authors
  tags: Tag[]
  about?: {
    featuredArticles: string[]
  }
}
```

- [ ] **Step 1.2: Add `about.featuredArticles` to `metadata.yaml`**

Add this block at the top level of `metadata.yaml` (after the `tags:` block):

```yaml
about:
  featuredArticles:
    - 12-iap-electron
    - 11-redesigning-city-flags-with-ai
    - 10-hpc-with-step-functions
```

These are the three most recent published articles as of writing. Update them any time by editing this YAML — no code change required.

- [ ] **Step 1.3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | grep -v baseUrl | grep -v "Visit"
```

Expected: no output (no errors).

- [ ] **Step 1.4: Commit**

```bash
git add types/metadata.d.ts metadata.yaml
git commit -m "feat: add about.featuredArticles to Metadata type and seed yaml"
```

---

## Task 2: Wire up sitemap and article author URLs

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/articles/[articleId]/page.tsx`

- [ ] **Step 2.1: Add `/about` to sitemap**

In `src/app/sitemap.ts`, find the `routes` array (currently contains entries for the homepage, `/tags`, `/archive`, `/projects`, `/journal`). Add `/about` after the homepage entry:

```ts
{
  url: 'https://blog.kochie.io/about',
  lastModified: new Date().toISOString(),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
},
```

- [ ] **Step 2.2: Add author URL to article metadata**

In `src/app/articles/[articleId]/page.tsx`, find `generateMetadata`. It currently returns an object with `title`, `description`, `twitter`, `keywords`, `alternates`, `openGraph`, and `other`. Add one field to the returned object:

```ts
authors: [{ name: author.fullName, url: '/about' }],
```

Place it after the existing `authors` line (which already reads `const author = metadata.authors?.[articleMetadata.author] || ''`). The returned metadata object should gain:

```ts
authors: [{ name: author.fullName, url: '/about' }],
```

- [ ] **Step 2.3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | grep -v baseUrl | grep -v "Visit"
```

Expected: no output.

- [ ] **Step 2.4: Commit**

```bash
git add src/app/sitemap.ts src/app/articles/[articleId]/page.tsx
git commit -m "feat: add /about to sitemap and author URL to article metadata"
```

---

## Task 3: ISO week utility and heatmap grid (TDD)

**Files:**
- Create: `src/lib/date-utils.ts`
- Create: `src/lib/__tests__/date-utils.test.ts`

- [ ] **Step 3.1: Write the failing tests**

Create `src/lib/__tests__/date-utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isoWeek, buildHeatmapGrid } from '../date-utils'

describe('isoWeek', () => {
  it('returns week 1 for 2024-01-01 (Monday)', () => {
    expect(isoWeek(new Date('2024-01-01'))).toEqual({ year: 2024, week: 1 })
  })

  it('returns week 52 for 2021-01-03 (Sunday, last week of 2020 ISO year)', () => {
    // 2021-01-03 belongs to ISO week 53 of 2020
    expect(isoWeek(new Date('2021-01-03'))).toEqual({ year: 2020, week: 53 })
  })

  it('handles week 53 in 2020', () => {
    expect(isoWeek(new Date('2020-12-31'))).toEqual({ year: 2020, week: 53 })
  })

  it('returns week 1 for 2021-01-04 (Monday)', () => {
    expect(isoWeek(new Date('2021-01-04'))).toEqual({ year: 2021, week: 1 })
  })

  it('returns correct week for a mid-year date', () => {
    // 2023-05-07 is a Sunday — ISO week 18 of 2023
    expect(isoWeek(new Date('2023-05-07'))).toEqual({ year: 2023, week: 18 })
  })
})

describe('buildHeatmapGrid', () => {
  it('returns empty maps for years with no articles', () => {
    const grid = buildHeatmapGrid([], 2021, 2021)
    expect(grid.get(2021)?.get(1)).toBeUndefined()
  })

  it('counts one article in the correct year and week', () => {
    const grid = buildHeatmapGrid(
      [{ publishedDate: '2023-05-07T10:00:00+10:00' }],
      2023,
      2023
    )
    expect(grid.get(2023)?.get(18)).toBe(1)
  })

  it('counts multiple articles in the same week', () => {
    const grid = buildHeatmapGrid(
      [
        { publishedDate: '2023-05-04T10:00:00+10:00' }, // week 18
        { publishedDate: '2023-05-07T10:00:00+10:00' }, // week 18
      ],
      2023,
      2023
    )
    expect(grid.get(2023)?.get(18)).toBe(2)
  })

  it('creates grid entries for all years in range', () => {
    const grid = buildHeatmapGrid([], 2021, 2023)
    expect(grid.has(2021)).toBe(true)
    expect(grid.has(2022)).toBe(true)
    expect(grid.has(2023)).toBe(true)
  })
})
```

- [ ] **Step 3.2: Run tests to confirm they fail**

```bash
pnpm vitest run src/lib/__tests__/date-utils.test.ts 2>&1 | tail -20
```

Expected: `FAIL` — `Cannot find module '../date-utils'`.

- [ ] **Step 3.3: Implement `src/lib/date-utils.ts`**

Create the file:

```ts
/**
 * Returns the ISO 8601 week year and week number for a given date.
 * ISO weeks start on Monday. Week 1 is the week containing the first Thursday.
 */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  // Shift so Monday = 0, Sunday = 6
  const day = (d.getUTCDay() + 6) % 7
  // Move to nearest Thursday to determine the ISO year
  d.setUTCDate(d.getUTCDate() - day + 3)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

/**
 * Builds a Map<year, Map<week, articleCount>> for the given year range.
 * Articles outside the year range are ignored.
 * Week numbers follow ISO 8601 (1–53).
 */
export function buildHeatmapGrid(
  articles: { publishedDate: string }[],
  startYear: number,
  endYear: number
): Map<number, Map<number, number>> {
  const grid = new Map<number, Map<number, number>>()
  for (let y = startYear; y <= endYear; y++) {
    grid.set(y, new Map())
  }
  for (const article of articles) {
    const { year, week } = isoWeek(new Date(article.publishedDate))
    if (year < startYear || year > endYear) continue
    const yearMap = grid.get(year)!
    yearMap.set(week, (yearMap.get(week) ?? 0) + 1)
  }
  return grid
}
```

- [ ] **Step 3.4: Run tests to confirm they pass**

```bash
pnpm vitest run src/lib/__tests__/date-utils.test.ts 2>&1 | tail -20
```

Expected: all tests `PASS`.

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/date-utils.ts src/lib/__tests__/date-utils.test.ts
git commit -m "feat: add isoWeek and buildHeatmapGrid utilities with tests"
```

---

## Task 4: OG image for `/about`

**Files:**
- Create: `src/app/about/opengraph-image.tsx`

Reference: `src/app/archive/opengraph-image.tsx` (identical pattern).

- [ ] **Step 4.1: Create the OG image file**

```bash
mkdir -p src/app/about
```

Create `src/app/about/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'About Robert Koch — Kochie Engineering'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  return new ImageResponse(
    <FieldJournalOG
      kicker="ABOUT"
      title="Robert Koch"
      deck="Software Engineer from Melbourne. Writing about engineering, maths, and technology."
      meta="KOCHIE ENGINEERING / BLOG"
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | grep -v baseUrl | grep -v "Visit"
```

Expected: no output.

- [ ] **Step 4.3: Commit**

```bash
git add src/app/about/opengraph-image.tsx
git commit -m "feat: add OG image for /about route"
```

---

## Task 5: About page — full server component

**Files:**
- Create: `src/app/about/page.tsx`

This task builds the complete page in one file. Read the full spec in `docs/superpowers/specs/2026-06-05-about-page-design.md` before starting — especially the heatmap section.

- [ ] **Step 5.1: Create `src/app/about/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/article-path'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { getUsedTags } from '@/lib/article-path'
import { buildHeatmapGrid, isoWeek } from '@/lib/date-utils'
import { SocialMediaButton } from '@/components/SocialMediaButton'

export async function generateMetadata(): Promise<Metadata> {
  const { authors } = await buildMetadata()
  const author = authors['kochie']
  return {
    title: 'About',
    description: author.bio,
    alternates: { canonical: '/about' },
    openGraph: {
      type: 'profile',
      url: '/about',
      title: 'About | Kochie Engineering',
      description: author.bio,
      siteName: 'Kochie Engineering',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About | Kochie Engineering',
      description: author.bio,
    },
  }
}

const HEATMAP_START_YEAR = 2021

// Intensity class for a cell count
function heatmapClass(count: number): string {
  if (count === 0) return 'bg-[var(--color-surface)]'
  if (count === 1) return 'bg-accent/25'
  if (count === 2) return 'bg-accent/60'
  return 'bg-accent'
}

// Returns the ISO week number of the first day of the given month (0-indexed)
function firstIsoWeekOfMonth(year: number, month: number): number {
  return isoWeek(new Date(year, month, 1)).week
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export default async function AboutPage() {
  const [{ authors, tags, about }, allArticles] = await Promise.all([
    buildMetadata(),
    getAllArticlesMetadata(),
  ])

  const author = authors['kochie']
  const featuredSlugs = about?.featuredArticles ?? []

  // Featured articles — in the order declared in YAML
  const featuredArticles = featuredSlugs
    .map((slug) => allArticles.find((a) => a.articleDir === slug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined)

  // Recent articles — newest first, excluding featured
  const featuredSet = new Set(featuredSlugs)
  const recentArticles = allArticles
    .filter((a) => !featuredSet.has(a.articleDir))
    .slice(0, 3)

  // Writing themes — top 6 tags by article count
  const themes = getUsedTags(allArticles, tags).slice(0, 6)

  // Heatmap grid
  const currentYear = new Date().getFullYear()
  const grid = buildHeatmapGrid(allArticles, HEATMAP_START_YEAR, currentYear)
  const years = Array.from({ length: currentYear - HEATMAP_START_YEAR + 1 }, (_, i) => HEATMAP_START_YEAR + i)

  // ProfilePage JSON-LD
  const sameAs = [
    'https://me.kochie.io',
    ...author.socialMedia
      .map((sm) => sm.link)
      .filter((link) => !link.startsWith('mailto:')),
  ]
  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.fullName,
      url: 'https://blog.kochie.io/about',
      description: author.bio,
      sameAs,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />

      <main className="mx-auto max-w-prose px-4 py-16">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-8 border-b border-rule">
          <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden ring-1 ring-rule">
            <Image
              fill
              sizes="80px"
              src={`/images/authors/${author.avatar.src}`}
              alt={`${author.fullName} portrait`}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif font-semibold text-h2 text-text leading-tight mb-1">
              {author.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-soft font-mono mb-3">
              <span>Software Engineer · Melbourne</span>
              <a
                href="https://me.kochie.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                me.kochie.io ↗
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-text-soft">
              {author.socialMedia.map((sm) => (
                <SocialMediaButton sm={sm} key={sm.name} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        <p className="font-serif text-base text-text-mute leading-relaxed mt-8 mb-10">
          {author.bio}
        </p>

        {/* ── Writing History heatmap ── */}
        <section className="mb-10">
          <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
            <span className="text-accent mr-2">{'// '}</span>
            WRITING HISTORY
          </div>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-max">
              {years.map((year) => {
                const yearMap = grid.get(year) ?? new Map<number, number>()

                // Month label positions for this year
                const monthLabels: { month: number; col: number }[] = []
                for (let m = 0; m < 12; m++) {
                  const col = firstIsoWeekOfMonth(year, m)
                  // Skip if too close to the previous label (< 3 cols gap)
                  const prev = monthLabels[monthLabels.length - 1]
                  if (!prev || col - prev.col >= 3) {
                    monthLabels.push({ month: m, col })
                  }
                }

                return (
                  <div key={year} className="mb-1">
                    {/* Month labels */}
                    <div className="flex items-end mb-0.5" style={{ gap: '3px' }}>
                      <span className="text-[10px] text-text-soft font-mono w-8 shrink-0 text-right pr-1" />
                      {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => {
                        const label = monthLabels.find((ml) => ml.col === w)
                        return (
                          <div key={w} className="w-[13px] shrink-0 text-[9px] text-text-soft font-mono leading-none text-center">
                            {label ? MONTH_ABBR[label.month] : ''}
                          </div>
                        )
                      })}
                    </div>
                    {/* Week cells */}
                    <div className="flex items-center" style={{ gap: '3px' }}>
                      <span className="text-[10px] text-text-soft font-mono w-8 shrink-0 text-right pr-1">
                        {year}
                      </span>
                      {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => {
                        const count = yearMap.get(w) ?? 0
                        const label = `Week ${w} of ${year}${count > 0 ? `: ${count} article${count > 1 ? 's' : ''}` : ''}`
                        return (
                          <div
                            key={w}
                            className={`w-[13px] h-[13px] shrink-0 rounded-[2px] ${heatmapClass(count)}`}
                            title={label}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-text-soft font-mono">
            <span>Less</span>
            {[0, 1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-[11px] h-[11px] rounded-[2px] ${heatmapClass(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </section>

        {/* ── Writing Themes ── */}
        <section className="mb-10">
          <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
            <span className="text-accent mr-2">{'// '}</span>
            WRITING THEMES
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="font-mono text-xs px-2.5 py-1 border border-rule rounded text-text-soft hover:text-text hover:border-accent transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Selected Writing ── */}
        <section className="mb-10">
          <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
            <span className="text-accent mr-2">{'// '}</span>
            SELECTED WRITING
          </div>
          <div className="divide-y divide-rule">
            {featuredArticles.map((article) => (
              <ArticleRow key={article.articleDir} article={article} />
            ))}
          </div>
        </section>

        {/* ── Recent Writing ── */}
        <section className="mb-10">
          <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
            <span className="text-accent mr-2">{'// '}</span>
            RECENT WRITING
          </div>
          <div className="divide-y divide-rule">
            {recentArticles.map((article) => (
              <ArticleRow key={article.articleDir} article={article} />
            ))}
          </div>
        </section>

      </main>
    </>
  )
}

// Shared article row used in both Selected and Recent sections
function ArticleRow({ article }: { article: { articleDir: string; title: string; publishedDate: string; tags: string[]; jumbotron: { url: string; alt: string; lqip: string } } }) {
  const date = new Date(article.publishedDate).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return (
    <Link
      href={`/articles/${article.articleDir}`}
      className="flex gap-3 py-3 group items-start hover:opacity-80 transition-opacity"
    >
      <div className="relative w-14 h-10 shrink-0 rounded overflow-hidden bg-surface">
        <Image
          fill
          sizes="56px"
          src={article.jumbotron.url}
          alt={article.jumbotron.alt}
          placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
          blurDataURL={article.jumbotron.lqip || undefined}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-serif text-sm text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </div>
        <div className="font-mono text-[10px] text-text-mute mt-0.5">
          {date}
          {article.tags[0] && (
            <span className="ml-2 text-text-soft">{article.tags[0]}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | grep -v baseUrl | grep -v "Visit"
```

Expected: no output.

- [ ] **Step 5.3: Run the dev server and check the page**

```bash
pnpm dev
```

Open `http://localhost:3000/about` and verify:
- Avatar displays correctly (circular, 80px)
- Social icon row renders
- Heatmap shows year rows 2021–current year with green-tinted cells on article weeks
- Hovering a cell with articles shows the tooltip
- Writing themes shows tag chips linking to `/tags/<slug>`
- Selected Writing shows 3 articles with thumbnails
- Recent Writing shows 3 different articles
- Page title in browser tab reads "About | Kochie Engineering"

- [ ] **Step 5.4: Run the full test suite**

```bash
pnpm test 2>&1 | tail -20
```

Expected: all existing tests still pass (the new `date-utils` tests also pass as they were written in Task 3).

- [ ] **Step 5.5: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add /about page with heatmap, featured articles, and ProfilePage JSON-LD"
```

---

## Post-Implementation Checklist

After all tasks are committed:

- [ ] Open `http://localhost:3000/about` and manually verify all six sections render correctly
- [ ] Check `http://localhost:3000/about/opengraph-image` to preview the OG image
- [ ] After deploying to production, validate structured data at https://search.google.com/test/rich-results using `https://blog.kochie.io/about`
- [ ] Submit updated sitemap in Google Search Console: `https://blog.kochie.io/sitemap.xml`
- [ ] Update `about.featuredArticles` in `metadata.yaml` to reflect your actual preferred articles
