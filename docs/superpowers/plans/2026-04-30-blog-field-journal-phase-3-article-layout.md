# Field Journal · Phase 3: Article Layout + Reading Scaffolding

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the article page to the Field Journal opening rhythm (kicker → H1 → deck → mono meta → optional hero → first paragraph), and add the reading scaffolding promised in spec §13: scroll-progress hairline, sticky sidebar TOC on wide screens, sidenotes that flow to the margin on desktop and inline on mobile, anchored heading § marks, and prev/next post navigation at the article foot.

**Architecture:**
- The `Article` component is rewritten end-to-end. Old jumbotron + Card layout is replaced.
- New components live under `src/components/{ScrollProgress,TOCSidebar,Sidenote,PrevNext}/`.
- TOC contents are extracted client-side from rendered headings (queryable by `id` thanks to rehype-slug). No build-time TOC plumbing changes — the existing `<TOC />` MDX component (the inline boxed widget) stays for articles that explicitly use it.
- Helper functions (`getArticleNumber`, `shouldShowUpdatedDate`, `findPrevNextArticles`) live in `src/lib/article-path.ts` alongside existing metadata utilities.
- The article page (`src/app/articles/[articleId]/page.tsx`) computes prev/next from the sorted metadata list and passes both to `<Article>`.

**Tech Stack:** React 19 (`useId`, `useState`, `useEffect`, IntersectionObserver) · Next.js 16 App Router · Tailwind 4 (Phase 1 tokens + Phase 2 figure system) · Vitest 4 + RTL.

**Reference:** Spec §10 (article opening pattern), §9.2 (article page layout), §13 (reading scaffolding) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation`. The branch will be renamed before merge if the user wants.

---

## File Structure

**New files:**
- `src/components/ScrollProgress/index.tsx` — top-of-viewport hairline gradient bar.
- `src/components/ScrollProgress/__tests__/ScrollProgress.test.tsx`
- `src/components/TOCSidebar/index.tsx` — sticky sidebar TOC for `xl:` breakpoint and up.
- `src/components/TOCSidebar/__tests__/TOCSidebar.test.tsx`
- `src/components/Sidenote/index.tsx` — desktop-margin / mobile-inline sidenote.
- `src/components/Sidenote/__tests__/Sidenote.test.tsx`
- `src/components/PrevNext/index.tsx` — two-card prev/next at article foot.
- `src/components/PrevNext/__tests__/PrevNext.test.tsx`
- `src/lib/__tests__/article-helpers.test.ts` — unit tests for the new helpers.

**Modified files:**
- `src/lib/article-path.ts` — add `getArticleNumber`, `shouldShowUpdatedDate`, `findPrevNextArticles` helpers.
- `src/components/Article/index.tsx` — full rewrite to the new opening rhythm + scaffolding integration.
- `src/components/MDXWrapper/components.tsx` — H2/H3 get hover-revealed `§` anchor links; register `Sidenote`.
- `src/app/articles/[articleId]/page.tsx` — compute prev/next from metadata and pass to `<Article>`.
- `src/components/index.ts` — re-export the new components.

**Files explicitly NOT changed in Phase 3:**
- The homepage (HeroFeature + RecentRow + ArchiveList) — Phase 4.
- Topbar / Footer / Theme button / Tag chrome — Phase 6.
- The MDX content files themselves.
- The Sentry / Fathom / metadata pipelines.
- The existing `<TOC />` inline MDX widget (rehype-toc-plugin) — kept for articles that explicitly use it. The new `TOCSidebar` is a separate, layout-level component.

---

## Task 1: Add helpers to `article-path.ts`

**Files:**
- Modify: `src/lib/article-path.ts`
- Create: `src/lib/__tests__/article-helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/article-helpers.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  getArticleNumber,
  shouldShowUpdatedDate,
  findPrevNextArticles,
} from '../article-path'
import type { ArticleMetadata } from '../article-path'

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '5 min read',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('getArticleNumber', () => {
  it('extracts the leading numeric prefix from articleDir', () => {
    expect(getArticleNumber('13-lambda-recursion')).toBe(13)
    expect(getArticleNumber('01-halo-physics')).toBe(1)
    expect(getArticleNumber('100-future')).toBe(100)
  })

  it('returns null when articleDir does not start with digits', () => {
    expect(getArticleNumber('article-blueprint')).toBeNull()
    expect(getArticleNumber('')).toBeNull()
  })
})

describe('shouldShowUpdatedDate', () => {
  it('returns false when edited matches published', () => {
    expect(
      shouldShowUpdatedDate('2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z')
    ).toBe(false)
  })

  it('returns false when edited is fewer than 14 days after published', () => {
    expect(
      shouldShowUpdatedDate('2025-01-01T00:00:00.000Z', '2025-01-13T00:00:00.000Z')
    ).toBe(false)
  })

  it('returns true when edited is 14 or more days after published', () => {
    expect(
      shouldShowUpdatedDate('2025-01-01T00:00:00.000Z', '2025-01-15T00:00:00.000Z')
    ).toBe(true)
    expect(
      shouldShowUpdatedDate('2025-01-01T00:00:00.000Z', '2025-04-30T00:00:00.000Z')
    ).toBe(true)
  })
})

describe('findPrevNextArticles', () => {
  // Note: getAllArticlesMetadata returns articles sorted by publishedDate DESC.
  // So index 0 is newest, index N is oldest.
  // "prev" = next-newer (lower index); "next" = next-older (higher index)
  // — i.e. the natural reading direction in an archive list.
  const list = [
    fix({ articleDir: '13-third', title: 'Third' }),
    fix({ articleDir: '12-second', title: 'Second' }),
    fix({ articleDir: '11-first', title: 'First' }),
  ]

  it('returns prev=null and next=second for the newest article', () => {
    const result = findPrevNextArticles(list, '13-third')
    expect(result.prev).toBeNull()
    expect(result.next?.articleDir).toBe('12-second')
  })

  it('returns prev=third and next=first for the middle article', () => {
    const result = findPrevNextArticles(list, '12-second')
    expect(result.prev?.articleDir).toBe('13-third')
    expect(result.next?.articleDir).toBe('11-first')
  })

  it('returns prev=second and next=null for the oldest article', () => {
    const result = findPrevNextArticles(list, '11-first')
    expect(result.prev?.articleDir).toBe('12-second')
    expect(result.next).toBeNull()
  })

  it('returns both null when the article is not in the list', () => {
    const result = findPrevNextArticles(list, 'nonexistent')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npm test -- article-helpers`
Expected: FAIL — exports `getArticleNumber`, `shouldShowUpdatedDate`, `findPrevNextArticles` not found.

- [ ] **Step 3: Add the helpers**

Append to `src/lib/article-path.ts`:

```ts
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
 * Given the full date-desc-sorted article list and the current article's dir,
 * return the prev (newer) and next (older) entries. Returns nulls at the ends.
 */
export function findPrevNextArticles(
  sortedArticles: ArticleMetadata[],
  currentArticleDir: string
): { prev: ArticleMetadata | null; next: ArticleMetadata | null } {
  const idx = sortedArticles.findIndex(
    (a) => a.articleDir === currentArticleDir
  )
  if (idx < 0) return { prev: null, next: null }
  return {
    prev: idx > 0 ? sortedArticles[idx - 1] : null,
    next: idx < sortedArticles.length - 1 ? sortedArticles[idx + 1] : null,
  }
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- article-helpers`
Expected: all assertions pass (3 + 3 + 4 = 10 cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/article-path.ts src/lib/__tests__/article-helpers.test.ts
git commit -m "add article-helpers: getArticleNumber, shouldShowUpdatedDate, findPrevNextArticles"
```

---

## Task 2: Build `ScrollProgress`

**Files:**
- Create: `src/components/ScrollProgress/index.tsx`
- Create: `src/components/ScrollProgress/__tests__/ScrollProgress.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, act } from '@testing-library/react'
import ScrollProgress from '../index'

afterEach(cleanup)

describe('ScrollProgress', () => {
  it('renders a fixed bar at the top of the viewport', () => {
    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('[data-scroll-progress]')
    expect(bar).toBeTruthy()
  })

  it('starts at 0% width and updates on scroll', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    })

    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('[data-scroll-progress]') as HTMLElement
    expect(bar.style.width).toBe('0%')

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    // 500 / (2000 - 1000) = 50%
    expect(bar.style.width).toMatch(/^50/)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- ScrollProgress`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ScrollProgress**

```tsx
'use client'

import React, { useEffect, useState } from 'react'

/**
 * Hairline progress bar pinned to the top of the viewport. Fills from 0% to
 * 100% as the document scrolls. The gradient runs from `accent` (clay) to
 * `signal` (signal yellow) so the visual cue rolls warmer as the reader
 * approaches the bottom.
 */
const ScrollProgress = (): React.ReactElement => {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? window.scrollY / max : 0
      setPercent(Math.min(100, Math.max(0, ratio * 100)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
    >
      <div
        data-scroll-progress
        className="h-full bg-gradient-to-r from-accent to-signal transition-[width] duration-100 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ScrollProgress
```

- [ ] **Step 4: Run tests**

Run: `npm test -- ScrollProgress`
Expected: 2/2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScrollProgress/index.tsx \
  src/components/ScrollProgress/__tests__/ScrollProgress.test.tsx
git commit -m "add ScrollProgress hairline gradient bar"
```

---

## Task 3: Build `TOCSidebar`

**Files:**
- Create: `src/components/TOCSidebar/index.tsx`
- Create: `src/components/TOCSidebar/__tests__/TOCSidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

The test builds heading nodes via DOM APIs (no innerHTML — keeps the security hook happy and avoids any risk of HTML parsing surprises in jsdom).

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import TOCSidebar from '../index'

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
})

const mountHeadings = (entries: { tag: 'h2' | 'h3'; id: string; text: string }[]) => {
  const article = document.createElement('article')
  for (const entry of entries) {
    const node = document.createElement(entry.tag)
    node.id = entry.id
    node.textContent = entry.text
    article.appendChild(node)
  }
  document.body.appendChild(article)
  return article
}

describe('TOCSidebar', () => {
  it('renders nothing when there are no headings to extract', () => {
    const article = document.createElement('article')
    document.body.appendChild(article)
    const { container } = render(<TOCSidebar containerSelector="article" />)
    expect(container.querySelector('[data-toc] li')).toBeNull()
  })

  it('builds a list of links from h2 and h3 elements with ids', () => {
    mountHeadings([
      { tag: 'h2', id: 'why', text: 'Why it explodes' },
      { tag: 'h3', id: 'really', text: 'Really' },
      { tag: 'h2', id: 'fix', text: 'The fix' },
    ])
    const { container } = render(<TOCSidebar containerSelector="article" />)
    const links = container.querySelectorAll('a[href^="#"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('#why')
    expect(links[1].getAttribute('href')).toBe('#really')
    expect(links[2].getAttribute('href')).toBe('#fix')
  })

  it('marks h3 entries with data-level for nested indent styling', () => {
    mountHeadings([
      { tag: 'h2', id: 'a', text: 'A' },
      { tag: 'h3', id: 'b', text: 'B' },
    ])
    const { container } = render(<TOCSidebar containerSelector="article" />)
    const items = container.querySelectorAll('[data-level]')
    expect(items[0].getAttribute('data-level')).toBe('h2')
    expect(items[1].getAttribute('data-level')).toBe('h3')
  })
})
```

If jsdom does not ship `IntersectionObserver`, the implementation no-ops the observer setup — but the test environment may still complain about referencing the global. Add a minimal stub at the top of the test file if needed:

```tsx
if (typeof globalThis.IntersectionObserver === 'undefined') {
  // @ts-expect-error - test-only stub
  globalThis.IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() { return [] }
  }
}
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- TOCSidebar`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement TOCSidebar**

```tsx
'use client'

import React, { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: 'h2' | 'h3'
}

interface TOCSidebarProps {
  /**
   * CSS selector for the article body that holds the rendered headings.
   * Defaults to `article`.
   */
  containerSelector?: string
}

const collectHeadings = (containerSelector: string): Heading[] => {
  const root = document.querySelector(containerSelector)
  if (!root) return []
  const nodes = root.querySelectorAll<HTMLHeadingElement>(
    'h2[id], h3[id]'
  )
  return Array.from(nodes).map((node) => ({
    id: node.id,
    text: node.textContent ?? '',
    level: node.tagName.toLowerCase() as 'h2' | 'h3',
  }))
}

/**
 * Sticky sidebar TOC for article pages. Hidden below the `xl:` breakpoint —
 * smaller screens get the inline `<TOC />` MDX widget if the author wants
 * one. Builds its list from rendered heading ids in the article body, and
 * highlights the heading currently in view via IntersectionObserver.
 */
const TOCSidebar = ({
  containerSelector = 'article',
}: TOCSidebarProps): React.ReactElement => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setHeadings(collectHeadings(containerSelector))
  }, [containerSelector])

  useEffect(() => {
    if (headings.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top
          )
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '0% 0% -75% 0%', threshold: 0 }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return <></>

  return (
    <nav
      aria-label="Article table of contents"
      data-toc
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 text-meta font-mono leading-loose"
    >
      <div className="text-text-soft mb-3 tracking-wide">// in this piece</div>
      <ol className="space-y-1 list-none">
        {headings.map((h) => {
          const active = h.id === activeId
          return (
            <li
              key={h.id}
              data-level={h.level}
              className={h.level === 'h3' ? 'pl-3' : ''}
            >
              <a
                href={`#${h.id}`}
                className={[
                  'block border-l-2 pl-3 py-0.5 transition-colors duration-fast',
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-mute hover:text-text',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default TOCSidebar
```

- [ ] **Step 4: Run tests**

Run: `npm test -- TOCSidebar`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/TOCSidebar/index.tsx \
  src/components/TOCSidebar/__tests__/TOCSidebar.test.tsx
git commit -m "add TOCSidebar with intersection-observer driven active state"
```

---

## Task 4: Build `Sidenote`

**Files:**
- Create: `src/components/Sidenote/index.tsx`
- Create: `src/components/Sidenote/__tests__/Sidenote.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import Sidenote from '../index'

afterEach(cleanup)

describe('Sidenote', () => {
  it('renders the marker and the note content', () => {
    const { getByText } = render(
      <Sidenote n={1}>This is the note text.</Sidenote>
    )
    expect(getByText('1')).toBeTruthy()
    expect(getByText('This is the note text.')).toBeTruthy()
  })

  it('exposes aria-describedby linking marker to note', () => {
    const { container } = render(<Sidenote n={2}>Body</Sidenote>)
    const marker = container.querySelector('sup')
    const note = container.querySelector('aside')
    expect(marker?.getAttribute('aria-describedby')).toBe(note?.id)
    expect(note?.id).toMatch(/sidenote-/)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- Sidenote`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement Sidenote**

```tsx
'use client'

import React, { useId, type PropsWithChildren } from 'react'

interface SidenoteProps {
  /**
   * Sequential reference number shown as the inline marker (1, 2, 3, …).
   * Authors number their own notes; this component does not auto-number.
   */
  n: number
}

/**
 * Inline-marker / margin-note component.
 *
 * Layout strategy:
 * - Above the `lg:` breakpoint, the note sits in the right margin (`md:` and
 *   below show it inline as a disclosure).
 * - The inline marker (`sup`) and the note (`aside`) are linked via
 *   `aria-describedby` so screen readers announce both.
 *
 * Authors mark their own numbers. Auto-numbering would couple this to the
 * Figure counter system, which is wrong (footnotes and figures are different
 * editorial categories).
 */
const Sidenote = ({
  n,
  children,
}: PropsWithChildren<SidenoteProps>): React.ReactElement => {
  const id = `sidenote-${useId().replace(/:/g, '')}`
  return (
    <>
      <sup
        aria-describedby={id}
        className="text-accent font-mono text-[0.7em] mx-0.5"
      >
        {n}
      </sup>
      <aside
        id={id}
        className="
          block lg:absolute lg:right-0 lg:translate-x-full
          lg:w-56 lg:ml-8
          my-3 lg:my-0
          p-3 lg:p-0
          rounded lg:rounded-none
          bg-bg-soft lg:bg-transparent
          border lg:border-l-2 border-rule lg:border-accent
          lg:pl-3
          font-mono text-meta text-text-mute leading-relaxed
        "
      >
        <span className="text-accent mr-2">{n}</span>
        {children}
      </aside>
    </>
  )
}

export default Sidenote
```

Note on layout: making the right-margin position truly correct (next to the paragraph that introduces the marker) requires the parent prose to be `relative`-positioned and have margin-right to make room. The Article restructure (Task 7) reserves that space. Until then, sidenotes degrade gracefully to their inline disclosure form.

- [ ] **Step 4: Run tests**

Run: `npm test -- Sidenote`
Expected: 2/2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidenote/index.tsx \
  src/components/Sidenote/__tests__/Sidenote.test.tsx
git commit -m "add Sidenote component with desktop margin / mobile inline disclosure"
```

---

## Task 5: Build `PrevNext`

**Files:**
- Create: `src/components/PrevNext/index.tsx`
- Create: `src/components/PrevNext/__tests__/PrevNext.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import PrevNext from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: '',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '',
    indexPath: '',
    articleDir: '',
    publishedDate: '',
    editedDate: '',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('PrevNext', () => {
  it('renders both prev and next when both are provided', () => {
    const { getByText } = render(
      <PrevNext
        prev={fix({ articleDir: '11-prev', title: 'Previous one' })}
        next={fix({ articleDir: '13-next', title: 'Next one' })}
      />
    )
    expect(getByText('Previous one')).toBeTruthy()
    expect(getByText('Next one')).toBeTruthy()
  })

  it('renders only the next card when prev is null', () => {
    const { getByText, queryByText } = render(
      <PrevNext prev={null} next={fix({ articleDir: '13', title: 'Older' })} />
    )
    expect(getByText('Older')).toBeTruthy()
    expect(queryByText(/Newer essay/i)).toBeNull()
  })

  it('renders nothing if both are null', () => {
    const { container } = render(<PrevNext prev={null} next={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('links each card to /articles/{articleDir}', () => {
    const { container } = render(
      <PrevNext
        prev={fix({ articleDir: '11-prev', title: 'P' })}
        next={fix({ articleDir: '13-next', title: 'N' })}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(Array.from(links).map((a) => a.getAttribute('href'))).toEqual([
      '/articles/11-prev',
      '/articles/13-next',
    ])
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- PrevNext`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement PrevNext**

```tsx
import React from 'react'
import Link from 'next/link'
import type { ArticleMetadata } from '@/lib/article-path'

interface PrevNextProps {
  prev: ArticleMetadata | null
  next: ArticleMetadata | null
}

const Card = ({
  article,
  label,
  alignRight,
}: {
  article: ArticleMetadata
  label: 'Newer essay' | 'Older essay'
  alignRight?: boolean
}) => (
  <Link
    href={`/articles/${article.articleDir}`}
    className={[
      'group block max-w-prose w-full p-5',
      'border border-rule rounded-md',
      'bg-bg-soft hover:bg-bg-deep transition-colors duration-fast',
      alignRight ? 'text-right' : 'text-left',
    ].join(' ')}
  >
    <div className="font-mono text-meta text-text-soft tracking-wide mb-2">
      {alignRight ? '→ ' : '← '}
      {label}
    </div>
    <div className="font-serif text-h3 text-text group-hover:text-accent transition-colors duration-fast">
      {article.title}
    </div>
  </Link>
)

/**
 * Prev/next article navigation. Renders nothing if both are null (so the
 * single oldest + newest articles get a clean foot). Order mirrors a
 * publication archive — "Newer" on the left, "Older" on the right.
 */
const PrevNext = ({ prev, next }: PrevNextProps): React.ReactElement | null => {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Adjacent essays"
      className="mx-auto max-w-bleed grid grid-cols-1 md:grid-cols-2 gap-4 my-16 px-4"
    >
      {prev ? (
        <Card article={prev} label="Newer essay" />
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Card article={next} label="Older essay" alignRight />
      ) : (
        <div aria-hidden />
      )}
    </nav>
  )
}

export default PrevNext
```

- [ ] **Step 4: Run tests**

Run: `npm test -- PrevNext`
Expected: 4/4 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PrevNext/index.tsx \
  src/components/PrevNext/__tests__/PrevNext.test.tsx
git commit -m "add PrevNext article-navigation component"
```

---

## Task 6: Anchored heading § marks in MDXWrapper

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Update H2 and H3**

Find the existing `H2` and `H3` constants. Replace them with versions that show a hover-revealed `§` anchor link to the heading's id.

```tsx
const H2 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h2
    id={id}
    style={{ scrollMarginTop: '50px' }}
    className="group relative font-serif font-semibold text-h2 text-text mt-12 mb-4"
  >
    {id ? (
      <a
        href={`#${id}`}
        aria-label="Anchor to this section"
        className="absolute -left-6 top-1/2 -translate-y-1/2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-fast no-underline font-mono text-base"
      >
        §
      </a>
    ) : null}
    {children}
  </h2>
)

const H3 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h3
    id={id}
    style={{ scrollMarginTop: '50px' }}
    className="group relative font-serif font-semibold text-h3 text-text mt-8 mb-3"
  >
    {id ? (
      <a
        href={`#${id}`}
        aria-label="Anchor to this section"
        className="absolute -left-5 top-1/2 -translate-y-1/2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-fast no-underline font-mono text-sm"
      >
        §
      </a>
    ) : null}
    {children}
  </h3>
)
```

The other heading levels (H1, H4-H6) keep their existing simple form — H1 is the article title (rendered separately by the new Article layout, not via MDX), and H4-H6 are uncommon enough that the inline anchor is overkill.

- [ ] **Step 2: Run MDXWrapper tests**

Run: `npm test -- MDXWrapper`
Expected: pass. If snapshots stale, regenerate.

- [ ] **Step 3: Commit**

```bash
git add src/components/MDXWrapper/components.tsx \
  src/components/MDXWrapper/__tests__/__snapshots__/components.test.tsx.snap
git commit -m "add hover-revealed § anchor links to article H2 and H3"
```

(Stage the snapshot only if it actually changed.)

---

## Task 7: Restructure the `Article` component

**Files:**
- Modify: `src/components/Article/index.tsx`

- [ ] **Step 1: Read the current implementation**

Run `cat src/components/Article/index.tsx` to see the current jumbotron + Card layout. Note that the Article currently:
- Renders a Jumbotron with the article's hero image at 60vh.
- Renders a Card with the title, tags, dates, author, and `{children}` (the MDX content).
- Already wraps `{children}` in `<FigureProvider>` from Phase 2 Task 3.

- [ ] **Step 2: Replace with the new layout**

Replace the contents of `src/components/Article/index.tsx` with:

```tsx
import React, { type PropsWithChildren } from 'react'
import { FigureProvider } from '@/components/Figure/context'
import Figure from '@/components/Figure'
import ScrollProgress from '@/components/ScrollProgress'
import TOCSidebar from '@/components/TOCSidebar'
import PrevNext from '@/components/PrevNext'
import {
  type ArticleMetadata,
  getArticleNumber,
  shouldShowUpdatedDate,
} from '@/lib/article-path'
import type { Author } from 'types/metadata'
import Image from 'next/image'

interface ArticleProps {
  article: ArticleMetadata
  author: Author
  prev: ArticleMetadata | null
  next: ArticleMetadata | null
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()

const Kicker = ({ article }: { article: ArticleMetadata }) => {
  const num = getArticleNumber(article.articleDir)
  const tags = article.tags.slice(0, 2)
  return (
    <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
      {num !== null ? <span className="text-accent mr-2">// {String(num).padStart(2, '0')}</span> : null}
      {tags.map((tag, i) => (
        <span key={tag}>
          {i > 0 ? <span className="mx-1 text-text-soft">·</span> : null}
          <span className="uppercase">{tag}</span>
        </span>
      ))}
    </div>
  )
}

const MetaLine = ({
  article,
  author,
}: {
  article: ArticleMetadata
  author: Author
}) => {
  const showUpdated = shouldShowUpdatedDate(
    article.publishedDate,
    article.editedDate
  )
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-meta text-text-soft tracking-wide pb-8 border-b border-rule">
      <span className="font-serif italic text-text">
        By {author.fullName}
      </span>
      <span aria-hidden className="text-text-soft">·</span>
      <span>{formatDate(article.publishedDate)}</span>
      <span aria-hidden className="text-text-soft">·</span>
      <span>{article.readTime.toUpperCase()}</span>
      {showUpdated ? (
        <>
          <span aria-hidden className="text-text-soft">·</span>
          <span>UPDATED {formatDate(article.editedDate)}</span>
        </>
      ) : null}
    </div>
  )
}

const HeroFigure = ({ article }: { article: ArticleMetadata }) => {
  if (!article.jumbotron?.url || !article.jumbotron?.alt) return null
  return (
    <div className="my-10">
      <Figure kind="image" tier="bleed" caption={article.jumbotron.alt}>
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          <Image
            src={article.jumbotron.url}
            alt={article.jumbotron.alt}
            fill
            sizes="(max-width: 1280px) 100vw, 1080px"
            blurDataURL={article.jumbotron.lqip}
            placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
            style={{ objectFit: 'cover' }}
          />
        </div>
      </Figure>
    </div>
  )
}

const Article = ({
  article,
  author,
  prev,
  next,
  children,
}: PropsWithChildren<ArticleProps>): React.ReactElement => {
  return (
    <article className="bg-bg text-text">
      <ScrollProgress />

      {/* Article opening: kicker → H1 → deck → meta */}
      <header className="mx-auto max-w-prose px-4 pt-16 pb-4">
        <Kicker article={article} />
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          {article.title}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-6">
          {article.blurb}
        </p>
        <MetaLine article={article} author={author} />
      </header>

      {/* Optional hero figure (only if frontmatter provides one) */}
      <div className="mx-auto max-w-bleed px-4">
        <HeroFigure article={article} />
      </div>

      {/* Body — TOC sidebar on xl+, prose on the right */}
      <div className="mx-auto max-w-bleed px-4 grid grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-12">
        <aside className="hidden xl:block pt-6">
          <TOCSidebar containerSelector="article [data-mdx-body]" />
        </aside>

        <FigureProvider>
          <div data-mdx-body className="max-w-prose mx-auto xl:mx-0 pt-6">
            {children}
          </div>
        </FigureProvider>
      </div>

      <PrevNext prev={prev} next={next} />
    </article>
  )
}

export default Article
export { Article }
```

Key behaviours:
- Outer `<article>` is the semantic wrapper.
- `ScrollProgress` lives at the top, fixed-position to the viewport.
- `Kicker` shows `// 13 · CDK · MATHS` etc. in mono with the number in clay.
- `<h1>` is the new big serif headline; `blurb` becomes the italic deck.
- `MetaLine` renders byline (italic serif), published date, read time, and the updated line conditionally.
- `HeroFigure` only renders if the article has a jumbotron; uses Figure with `tier="bleed"` and 16:9 aspect ratio. Articles with no jumbotron show nothing here (the new design opts for hook-first).
- The body uses a 2-col grid above `xl:` — `200px` for the TOC sidebar, then prose. Below `xl:` the TOC sidebar is hidden.
- `<TOCSidebar containerSelector="article [data-mdx-body]" />` — scoped to the MDX body so navigation links to the article body's own headings (not chrome).
- `FigureProvider` continues to wrap the MDX body so figure counters scope per-article.
- `<PrevNext>` at the foot.

The old `Card` and `Jumbotron` usages are gone. The `AuthorLink` helper is gone too — the byline is rendered inline.

- [ ] **Step 3: Run Article tests**

Run: `npm test -- Article`
Expected: snapshots and assertions may need updating. Tests were written against the prior layout (Jumbotron + Card). Update them to assert on the new structure: the `<header>` block exists, the kicker renders, the deck renders, the meta line renders. If snapshot tests fail and the new structure is correct, regenerate them.

If the existing test asserts on a specific class that no longer exists (e.g. the old `text-5xl` h1), update it to assert on the new equivalent (`text-display-h1` or just confirm an `<h1>` is present with the article title).

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: all green. The `prev` and `next` props are new — if any test renders Article without those props, you'll need to add `prev={null}` and `next={null}` to satisfy the type.

- [ ] **Step 5: Commit**

```bash
git add src/components/Article/index.tsx \
  src/components/Article/__tests__/Article.test.tsx \
  src/components/Article/__tests__/__snapshots__/Article.test.tsx.snap
git commit -m "rewrite Article layout to Field Journal opening rhythm + scaffolding"
```

(Stage the snapshot file only if it actually changed.)

---

## Task 8: Pass prev/next from the article page; register Sidenote in MDX map

**Files:**
- Modify: `src/app/articles/[articleId]/page.tsx`
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Update the article page to compute and pass prev/next**

In `src/app/articles/[articleId]/page.tsx`:

Find the import block at the top and add `getAllArticlesMetadata` and `findPrevNextArticles` to the existing `@/lib/article-path` import:

```tsx
import {
  buildMetadata,
  getArticleMetadata,
  getArticles,
  getAllArticlesMetadata,
  findPrevNextArticles,
} from '@/lib/article-path'
```

Find the line where `<Article article={articleMetadata} author={author}>` is rendered. Just before that line, compute prev/next:

```tsx
const sortedArticles = await getAllArticlesMetadata()
const { prev, next } = findPrevNextArticles(
  sortedArticles,
  articleMetadata.articleDir
)
```

Then pass them to Article:

```tsx
<Article article={articleMetadata} author={author} prev={prev} next={next}>
  <MDXContent components={components} />
</Article>
```

- [ ] **Step 2: Register Sidenote in the MDX components map**

In `src/components/MDXWrapper/components.tsx`, add:

```tsx
import Sidenote from '@/components/Sidenote'
```

And add `Sidenote,` to the `components` export object alongside `Figure` and `Equation`.

- [ ] **Step 3: Run tests + build**

Run: `npm test`
Expected: pass.

Run: `npm run build`
Expected: build succeeds with all 36 static pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/articles/[articleId]/page.tsx \
  src/components/MDXWrapper/components.tsx
git commit -m "wire prev/next into article page; register Sidenote in MDX map"
```

---

## Task 9: Re-export new components from `src/components/index.ts`

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add re-exports**

Look at the existing `src/components/index.ts` to see the export style. It likely uses re-exports like `export { default as Topbar } from './Topbar'`. Add re-exports for the new components — `ScrollProgress`, `TOCSidebar`, `Sidenote`, `PrevNext` — following the same style.

Do NOT export `Figure` or `Equation` here unless the existing file already re-exports MDX-only components — those are imported by name from their package paths in MDXWrapper. Match the file's existing convention.

- [ ] **Step 2: Confirm no test or import regression**

Run: `npm test`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "re-export Phase 3 components from src/components"
```

---

## Task 10: Smoke test on existing articles

**Files:**
- No changes — verification only.

- [ ] **Step 1: Run `npm test` and `npm run build`**

Both should pass cleanly.

- [ ] **Step 2: Run dev server and visit articles**

Run: `npm run dev`

Visit:
- `http://localhost:3000/articles/13-lambda-recursion` — code, embeds, sidebar TOC, prev/next
- `http://localhost:3000/articles/01-halo-physics` — math, hero image, sidebar TOC
- `http://localhost:3000/articles/02-contact-tracing` — long article with many H2/H3, GithubProject, code blocks. Best test for the sidebar TOC and scroll progress.

Open the browser console. Check for:
- No hydration errors.
- No "Cannot read property of undefined" errors on metadata.

Visual / behaviour checks (no formal assertions; eyeball + interact):
- ScrollProgress fills as you scroll, gradient clay→signal.
- Sidebar TOC visible on viewport ≥ 1280px wide. Hidden below.
- TOC links navigate to the heading; active state updates as you scroll.
- Anchor `§` mark appears on heading hover.
- Prev/Next cards at the article foot link to adjacent articles.
- Article opening reads kicker → big serif H1 → italic deck → mono meta. Hero image follows (when present). First paragraph follows the hero.
- Updated-date line shows ONLY on articles where editedDate is ≥14 days after publishedDate.

If any check fails, capture the failure precisely (URL, element, console error) and report. Do not silently fix mid-smoke-test — Phase 3 ends here and any follow-on fix is its own commit.

- [ ] **Step 3: Stop the dev server.**

- [ ] **Step 4: Commit only if anything was nudged in this verification step (likely nothing).**

---

## Phase 3 wrap-up

After Task 10 passes, Phase 3 is complete:
- Article page restructured to the spec opening rhythm.
- Scroll-progress hairline, sticky TOC sidebar (≥xl:), sidenotes, anchored heading marks, prev/next navigation — all in place.
- The old Jumbotron-Card pattern is retired from articles. Phase 4 will reuse it conceptually for the homepage HeroFeature.

**Suggested squashed PR commit message** (when the redesign branch eventually lands):

```
Field Journal · Phase 3: article layout + reading scaffolding

- Restructured Article opening: kicker → H1 → deck → mono meta → optional hero → first paragraph
- ScrollProgress hairline gradient bar pinned to viewport top
- TOCSidebar with intersection-observer driven active state, visible above xl:
- Sidenote component: desktop margin / mobile inline disclosure, aria-described
- Prev/Next article navigation at article foot, pulled from getAllArticlesMetadata
- Article H2/H3 get hover-revealed § anchor links
- Helper utilities: getArticleNumber, shouldShowUpdatedDate, findPrevNextArticles

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §10, §13
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-3-article-layout.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 3 covers spec §9.2 (article page architecture), §10 (article opening pattern), §13 (reading scaffolding). It does not cover the homepage (§9.1 — Phase 4), tag/archive pages (§9.3-§9.4 — Phase 5), or chrome (§9.1 topbar, footer — Phase 6).

**Placeholder scan** — No TBD/TODO. The "register Sidenote" task explicitly does it; the snapshot regeneration guidance is concrete.

**Type consistency** — `ArticleMetadata` is the existing exported type; helpers and PrevNext use it consistently. `prev` and `next` are typed `ArticleMetadata | null` everywhere they appear (helper return type, PrevNext props, Article props, page-level computation).

**Scope check** — 10 tasks, mostly TDD-driven. No task spans more than ~150 lines of code. The Article rewrite (Task 7) is the largest single change but stays inside one file. Phase 3 stays within one focused goal: article-page reading experience.

**Open follow-ups (deferred to Phase 3.5 or later):**
- The TOCSidebar uses client-side DOM extraction. A build-time TOC injection (extending rehype-toc-plugin) would render with the page (no flash). Acceptable for now; SSR-time TOC extraction is a future polish.
- Sidenote in-margin positioning ideally relates to the paragraph that introduces the marker; the current implementation uses Tailwind absolute positioning that may or may not line up perfectly with the marker. Visual refinement during the Phase 3 smoke test or in a small follow-up.
- The "/archive" page mentioned in the spec is Phase 5, but PrevNext gives one form of inter-article navigation in the meantime.
