# Field Journal · Phase 5: `/archive` and Tag Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the standalone `/archive` page (spec §9.3) and restyle the existing `/tags` and `/tags/[tagId]` pages (spec §9.4) to the Field Journal palette. The archive reuses `ArchiveList` from Phase 4. Tag pages get a serif header + italic deck + filtered archive list. The all-tags index gets a quiet pill grid.

**Architecture:**
- New `/archive` route under `src/app/archive/page.tsx` — wraps `ArchiveList` with the full article list. A row of tag chips above the list links to `/tags/[tag]` (no client-side filtering — chips are static links).
- `/tags/[tagId]/page.tsx` is rewritten to use `ArchiveList` filtered by the tag, plus a header block with `display-h1` tag name and italic deck.
- `/tags/page.tsx` gets a Field Journal restyle: drop the Jumbotron, drop the Card-based grid, render a clean pill grid linking to each tag page.
- The `Tag` component restyles to a mono pill with clay border. `TagSet` stays the same (just a flex container).
- The "See the archive →" link in `RecentRow` updates from `#archive` (in-page anchor) to `/archive` (route).

**Tech Stack:** React 19 · Next.js 16 App Router · `next/image` · `next/link` · Tailwind 4 (Phase 1 tokens) · Vitest 4 + RTL.

**Reference:** Spec §9.3 (archive page), §9.4 (tag pages) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation`.

---

## File Structure

**New files:**
- `src/app/archive/page.tsx` — new standalone archive route.
- `src/components/TagChips/index.tsx` — small wrapper that renders a row of mono pill links to tag pages.
- `src/components/TagChips/__tests__/TagChips.test.tsx`

**Modified files:**
- `src/components/Tag/index.tsx` — restyle to mono pill with clay border.
- `src/components/Tag/Tag.module.css` — slim down or replace; only what's needed for the pill shape.
- `src/components/RecentRow/index.tsx` — update "See the archive →" link to `/archive`.
- `src/app/tags/[tagId]/page.tsx` — replace Jumbotron + Gallery with header + ArchiveList.
- `src/app/tags/page.tsx` — replace Jumbotron + Card grid with serif header + tag pill grid.

**Files NOT changed in Phase 5:**
- The article page or the article components.
- The homepage (other than the archive link in RecentRow).
- Topbar / Footer / Theme button — Phase 6.
- The metadata pipeline.

---

## Task 1: Restyle the `Tag` component

**Files:**
- Modify: `src/components/Tag/index.tsx`
- Modify: `src/components/Tag/Tag.module.css` (only if needed; otherwise remove the `style` import and use Tailwind directly)

- [ ] **Step 1: Replace the Tag component body**

Replace `src/components/Tag/index.tsx` with:

```tsx
import React from 'react'
import Link from 'next/link'

interface TagProps {
  name: string
  link: string
  /**
   * Inverted variant fills the chip with `accent` instead of using a border.
   * Used in places where the chip needs more visual weight (e.g. on a hero).
   */
  inverted?: boolean
}

interface TagSetProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ name, link, inverted }: TagProps) {
  const base =
    'inline-block font-mono text-meta tracking-wide px-3 py-1 rounded-full transition-colors duration-fast'
  const bordered = 'border border-rule text-text-mute hover:text-accent hover:border-accent'
  const filled = 'bg-accent text-bg hover:bg-accent/85'
  return (
    <Link href={link} className={`${base} ${inverted ? filled : bordered}`}>
      {name}
    </Link>
  )
}

export function TagSet({ children, className }: TagSetProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {children}
    </div>
  )
}
```

The `Tag.module.css` import is gone. The flex/wrap styling is inlined into TagSet. Tag's pill shape is fully Tailwind-driven and theme-aware via the new tokens.

- [ ] **Step 2: Delete or empty `src/components/Tag/Tag.module.css`**

Run `git rm src/components/Tag/Tag.module.css` (or simply remove its contents — but the file is no longer referenced, so deletion is cleaner). Stage the deletion.

- [ ] **Step 3: Run Tag tests**

Run: `npm test -- Tag`
Expected: pass. If a snapshot test stales because of the rendered class change, regenerate.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tag/index.tsx \
  src/components/Tag/Tag.module.css \
  src/components/Tag/__tests__/__snapshots__/Tag.test.tsx.snap
git commit -m "restyle Tag: mono pill with clay border, inverted=filled clay"
```

(Stage the snapshot only if it actually changed. The Tag.module.css line is `git rm` so it appears as a deletion.)

---

## Task 2: Build `TagChips`

**Files:**
- Create: `src/components/TagChips/index.tsx`
- Create: `src/components/TagChips/__tests__/TagChips.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import TagChips from '../index'

afterEach(cleanup)

describe('TagChips', () => {
  it('renders one chip per tag with a /tags/ href', () => {
    const { container } = render(<TagChips tags={['cdk', 'maths', 'gaming']} />)
    const links = container.querySelectorAll('a[href^="/tags/"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('/tags/cdk')
    expect(links[2].getAttribute('href')).toBe('/tags/gaming')
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<TagChips tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('lower-cases the tag in the URL but preserves the visible label', () => {
    const { getByText, container } = render(<TagChips tags={['CDK']} />)
    expect(getByText('CDK')).toBeTruthy()
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/tags/cdk')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- TagChips`
Expected: FAIL.

- [ ] **Step 3: Implement TagChips**

```tsx
import React from 'react'
import { Tag, TagSet } from '@/components/Tag'

interface TagChipsProps {
  tags: string[]
  /**
   * Optional label rendered above the chips, e.g. "// FILTER · by tag".
   */
  label?: string
}

/**
 * A horizontal row of tag-pill links. Used on `/archive` as a static filter
 * (each chip navigates to the corresponding tag page). Composes the existing
 * Tag and TagSet primitives.
 */
const TagChips = ({
  tags,
  label,
}: TagChipsProps): React.ReactElement | null => {
  if (tags.length === 0) return null
  return (
    <div>
      {label ? (
        <div className="font-mono text-meta tracking-wide text-text-soft mb-3">
          {label}
        </div>
      ) : null}
      <TagSet>
        {tags.map((tag) => (
          <Tag key={tag} name={tag} link={`/tags/${tag.toLowerCase()}`} />
        ))}
      </TagSet>
    </div>
  )
}

export default TagChips
```

- [ ] **Step 4: Run tests**

Run: `npm test -- TagChips`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/TagChips/index.tsx \
  src/components/TagChips/__tests__/TagChips.test.tsx
git commit -m "add TagChips: row of pill links to tag pages"
```

---

## Task 3: Create `/archive` page

**Files:**
- Create: `src/app/archive/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import React from 'react'
import { Metadata } from 'next'
import ArchiveList from '@/components/ArchiveList'
import TagChips from '@/components/TagChips'
import { getAllArticlesMetadata } from '@/lib/article-path'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Every essay on Kochie Engineering / Blog, by year.',
  alternates: {
    canonical: '/archive',
  },
}

export default async function Archive() {
  const articles = await getAllArticlesMetadata()

  // Build the tag chip row from the union of all tags used in articles,
  // sorted by frequency (most-tagged first).
  const tagCounts = new Map<string, number>()
  for (const article of articles) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">ARCHIVE</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Every essay, by year.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          The full Kochie Engineering / Blog index. {articles.length} essays
          and counting.
        </p>
      </header>

      <div className="mx-auto max-w-bleed px-4 pb-8">
        <TagChips tags={sortedTags} label="// FILTER · by tag" />
      </div>

      <ArchiveList articles={articles} />
    </main>
  )
}
```

- [ ] **Step 2: Build to confirm**

Run: `npm run build`
Expected: build succeeds. The `/archive` route appears in the SSG output.

- [ ] **Step 3: Commit**

```bash
git add src/app/archive/page.tsx
git commit -m "add /archive page: header + tag-chip filter row + full archive list"
```

---

## Task 4: Update RecentRow's "See the archive →" link

**Files:**
- Modify: `src/components/RecentRow/index.tsx`

- [ ] **Step 1: Update the link**

In `src/components/RecentRow/index.tsx`, find the line:

```tsx
<Link href="#archive" className="...">See the archive →</Link>
```

Change `href="#archive"` to `href="/archive"`.

- [ ] **Step 2: Verify**

Run: `npm test -- RecentRow`
Expected: pass. The existing test asserts the card hrefs but does not assert on the "See the archive →" link's href, so this should not break anything. If somehow it does, update the test.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecentRow/index.tsx
git commit -m "point RecentRow archive link to /archive page"
```

---

## Task 5: Restyle `/tags/[tagId]/page.tsx`

**Files:**
- Modify: `src/app/tags/[tagId]/page.tsx`

- [ ] **Step 1: Replace the page**

Replace `src/app/tags/[tagId]/page.tsx` contents with:

```tsx
import React from 'react'
import { Metadata } from 'next'
import ArchiveList from '@/components/ArchiveList'
import { getAllArticlesMetadata } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadata from '$metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagId: string }>
}): Promise<Metadata> {
  const tagId = (await params).tagId
  const tagName = tagId.replace(/^\w/, (c) => c.toUpperCase())
  const image = metadata.tags.find(
    (tag: Tag) => tag.name.toLowerCase() === tagId.toLowerCase()
  )?.image

  return {
    title: tagName,
    alternates: {
      canonical: `/tags/${tagId.toLowerCase()}`,
    },
    description: `A collection of articles tagged with ${tagName}.`,
    openGraph: {
      title: `${tagName} | Kochie Engineering`,
      url: `/tags/${tagId.toLowerCase()}`,
      description: `A collection of articles tagged with ${tagName}.`,
      type: 'website',
      siteName: 'Kochie Engineering',
      images: image ? { url: `/images/tags/${image.src}`, alt: tagName } : undefined,
    },
  }
}

const TagComponent = async ({
  params,
}: {
  params: Promise<{ tagId: string }>
}) => {
  const { tagId } = await params
  const allArticles = await getAllArticlesMetadata()
  const tagArticles = allArticles.filter((article) =>
    article.tags.some((t) => t.toLowerCase() === tagId.toLowerCase())
  )

  const tagMeta = metadata.tags.find(
    (t: Tag) => t.name.toLowerCase() === tagId.toLowerCase()
  )
  const displayName = tagMeta?.name ?? tagId
  const blurb =
    tagMeta?.blurb ??
    `Essays tagged with ${displayName}.`

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
        </p>
      </header>

      {tagArticles.length === 0 ? (
        <div className="mx-auto max-w-prose px-4 py-12 font-serif italic text-text-mute">
          No essays tagged {displayName} yet.
        </div>
      ) : (
        <ArchiveList articles={tagArticles} />
      )}
    </main>
  )
}

export const generateStaticParams = async () => {
  if (!Array.isArray(metadata.tags)) return []
  return metadata.tags.map((tag: Tag) => ({
    tagId: tag.name,
  }))
}

export default TagComponent
```

The old `tagLookup` helper (which supported `tags: string | string[]`) is gone — the route only ever resolves a single `tagId`, so the array branch was dead. The Jumbotron + Gallery is replaced by the new header + ArchiveList. The `style` module import is gone.

- [ ] **Step 2: Build to confirm**

Run: `npm run build`
Expected: build succeeds. Tag pages SSG correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/tags/[tagId]/page.tsx
git commit -m "restyle /tags/[tagId] page: header + filtered ArchiveList"
```

---

## Task 6: Restyle `/tags` index page

**Files:**
- Modify: `src/app/tags/page.tsx`

- [ ] **Step 1: Replace the index page**

Replace `src/app/tags/page.tsx` contents with:

```tsx
import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { getAllArticlesMetadata } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadata from '$metadata'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'The tags used in my blog posts.',
  alternates: {
    canonical: `/tags`,
  },
}

export default async function Tags() {
  const articles = await getAllArticlesMetadata()
  const tagsCounted = (metadata.tags as Tag[]).map((tag) => ({
    ...tag,
    articleCount: articles.reduce(
      (acc, article) => acc + (article.tags.includes(tag.name) ? 1 : 0),
      0
    ),
  }))

  // Sort by count descending, then alphabetical.
  tagsCounted.sort(
    (a, b) =>
      b.articleCount - a.articleCount || a.name.localeCompare(b.name)
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
          {tagsCounted.length} ways to slice the archive.
        </p>
      </header>

      <ul className="mx-auto max-w-bleed px-4 pb-16 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tagsCounted.map((tag) => (
          <li key={tag.name}>
            <Link
              href={`/tags/${tag.name.toLowerCase()}`}
              className="group flex items-baseline justify-between border border-rule rounded-md px-4 py-3 hover:border-accent transition-colors duration-fast"
            >
              <div>
                <div className="font-serif font-semibold text-text capitalize group-hover:text-accent transition-colors duration-fast">
                  {tag.name}
                </div>
                {tag.blurb ? (
                  <div className="font-serif italic text-body-sm text-text-mute leading-snug mt-1">
                    {tag.blurb}
                  </div>
                ) : null}
              </div>
              <div className="font-mono text-meta text-text-soft tracking-wide whitespace-nowrap ml-4">
                {tag.articleCount}{' '}
                {tag.articleCount === 1 ? 'essay' : 'essays'}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

The tag-image-with-grayscale-on-hover Card layout is gone (those tag images aren't strong content; the simple text card is more honest with the data). The Jumbotron is gone. The lqip-loading dance is gone (no images on this page anymore).

- [ ] **Step 2: Build to confirm**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/tags/page.tsx
git commit -m "restyle /tags index: serif header + grid of tag pill cards"
```

---

## Task 7: Re-export TagChips and smoke test

**Files:**
- Modify: `src/components/index.ts`
- No other source changes — verification step.

- [ ] **Step 1: Add TagChips re-export**

In `src/components/index.ts`, add alongside the other Phase 4/Phase 3 re-exports:

```ts
export { default as TagChips } from './TagChips'
```

- [ ] **Step 2: Run tests + build**

Run: `npm test`
Expected: pass.

Run: `npm run build`
Expected: build succeeds. New routes appear in the SSG output: `/archive`, plus the existing `/tags`, `/tags/[tagId]` rebuilt.

- [ ] **Step 3: Run dev server and visit each new page**

Run: `npm run dev`

Visit:
- `http://localhost:3000/archive` — header + tag-chip filter row + full numbered archive list.
- `http://localhost:3000/tags` — quiet pill grid of all tags with counts.
- `http://localhost:3000/tags/cdk` (or any other tag) — header for the tag + filtered ArchiveList.

Visual / behaviour checks:
- All three pages render with warm soot bg in dark mode, cream paper in light mode.
- ArchiveList shows year groupings on `/archive` and `/tags/[tag]`.
- Tag chips on `/archive` link to their tag pages.
- "See the archive →" link in RecentRow on `/` now navigates to `/archive`.
- No console errors beyond the pre-existing Sentry CSP message.

- [ ] **Step 4: Stop the dev server.**

- [ ] **Step 5: Commit the re-export**

```bash
git add src/components/index.ts
git commit -m "re-export TagChips"
```

---

## Phase 5 wrap-up

After Task 7 passes, Phase 5 is complete:
- `/archive` exists.
- `/tags/[tagId]` and `/tags` are restyled to Field Journal.
- Tag component is now a mono pill with clay border.
- "See the archive →" link in RecentRow resolves to the new route.

**Suggested squashed PR commit message:**

```
Field Journal · Phase 5: archive page + tag pages restyle

- New /archive route with full numbered archive list, sorted tag-chip filter row, header
- /tags/[tagId] rewritten to use ArchiveList filtered by tag
- /tags index restyled to a quiet pill grid with article counts
- Tag component restyled: mono pill, clay border (or filled clay when inverted)
- TagChips wrapper for static tag-link rows
- RecentRow "See the archive →" updated from #archive to /archive

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §9.3, §9.4
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-5-archive-tags.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 5 covers spec §9.3 (archive page) and §9.4 (tag pages). It does not cover §9.5 (author page redesign — explicitly out of scope per the spec) or chrome (Phase 6).

**Placeholder scan** — No TBD/TODO. The "delete the Tag.module.css if not referenced" guidance is concrete. Test stub for "Tag.module.css optional" is realistic.

**Type consistency** — `Tag` type from `types/metadata` is consistent. `tagLookup` helper removed (was supporting an unused array form). `TagChips` accepts a flat `string[]`.

**Scope check** — 7 tasks. Each touches a small surface. No task spans more than ~150 lines.

**Open follow-ups (deferred):**
- The /archive tag-chips row is static (each chip is a link to a tag page). If interactive client-side filtering is desired later, that's a Phase 5.5 enhancement.
- The /tags page no longer shows tag images. If the visual richness of those is missed, a future polish pass can reintroduce them as a small inline thumbnail per tag pill — but the simpler text grid is consistent with the restrained Field Journal register.
