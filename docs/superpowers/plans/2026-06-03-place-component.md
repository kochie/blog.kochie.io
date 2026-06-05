# Place Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `<Place>` MDX component that renders a place name as a hyperlink and optionally appends FontAwesome icon-links for Instagram and a map URL.

**Architecture:** One new component file (`src/components/Place/index.tsx`) with its own test suite, registered in the existing MDX component map in `src/components/MDXWrapper/components.tsx`. No new dependencies required — FontAwesome packages and `next/link` are already used in the codebase.

**Tech Stack:** React, TypeScript, Tailwind CSS, FontAwesome (`@fortawesome/react-fontawesome`, `@fortawesome/free-brands-svg-icons`, `@fortawesome/free-solid-svg-icons`), `next/link`, Vitest + Testing Library.

---

## File map

| File | Action |
|------|--------|
| `src/components/Place/index.tsx` | Create — the component |
| `src/components/Place/__tests__/Place.test.tsx` | Create — unit tests |
| `src/components/MDXWrapper/components.tsx` | Modify — add `Place` to the `components` map |
| `journal/2026-06-02.md` | Modify — fix typo ("hard and Hound" → "Harp and Hound") and complete the sentence |

---

## Task 1: Place component + tests

**Files:**
- Create: `src/components/Place/__tests__/Place.test.tsx`
- Create: `src/components/Place/index.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Place/__tests__/Place.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import Place from '../index'

afterEach(cleanup)

describe('Place', () => {
  it('renders the place name as a link to the website', () => {
    const { getByText } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    const link = getByText('Harp and Hound').closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('does not render an instagram link when the prop is absent', () => {
    const { container } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Instagram"]')
    ).toBeNull()
  })

  it('does not render a map link when the prop is absent', () => {
    const { container } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Maps"]')
    ).toBeNull()
  })

  it('renders an instagram icon link when instagram prop is provided', () => {
    const { container } = render(
      <Place link="https://example.com" instagram="myfoo">
        Harp and Hound
      </Place>
    )
    const link = container.querySelector(
      '[aria-label="Harp and Hound on Instagram"]'
    )
    expect(link).not.toBeNull()
    expect(link).toHaveAttribute('href', 'https://instagram.com/myfoo')
  })

  it('renders a map icon link when map prop is provided', () => {
    const { container } = render(
      <Place link="https://example.com" map="https://maps.apple.com/?q=test">
        Harp and Hound
      </Place>
    )
    const link = container.querySelector(
      '[aria-label="Harp and Hound on Maps"]'
    )
    expect(link).not.toBeNull()
    expect(link).toHaveAttribute('href', 'https://maps.apple.com/?q=test')
  })

  it('renders both icon links when both props are provided', () => {
    const { container } = render(
      <Place
        link="https://example.com"
        instagram="myfoo"
        map="https://maps.apple.com/?q=test"
      >
        Harp and Hound
      </Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Instagram"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[aria-label="Harp and Hound on Maps"]')
    ).not.toBeNull()
  })

  it('all links open in a new tab with noopener noreferrer', () => {
    const { container } = render(
      <Place
        link="https://example.com"
        instagram="myfoo"
        map="https://maps.apple.com/?q=test"
      >
        Harp and Hound
      </Place>
    )
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(3)
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm test -- src/components/Place/__tests__/Place.test.tsx
```

Expected: Tests fail with `Cannot find module '../index'`.

- [ ] **Step 3: Implement the component**

Create `src/components/Place/index.tsx`:

```tsx
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

interface PlaceProps {
  children: string
  link: string
  instagram?: string
  map?: string
}

export default function Place({ children, link, instagram, map }: PlaceProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-accent underline underline-offset-2"
      >
        {children}
      </Link>
      {instagram && (
        <Link
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${children} on Instagram`}
          className="text-[0.75em] text-text-mute hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faInstagram} />
        </Link>
      )}
      {map && (
        <Link
          href={map}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${children} on Maps`}
          className="text-[0.75em] text-text-mute hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faLocationDot} />
        </Link>
      )}
    </span>
  )
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
npm test -- src/components/Place/__tests__/Place.test.tsx
```

Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Place/index.tsx src/components/Place/__tests__/Place.test.tsx
git commit -m "feat: add Place component with website, instagram, and map links"
```

---

## Task 2: Register in MDX component map + fix journal entry

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx` (line ~4 for the import, line ~368 for the map entry)
- Modify: `journal/2026-06-02.md` (line 24)

- [ ] **Step 1: Add the import to `components.tsx`**

Open `src/components/MDXWrapper/components.tsx`. The file imports other components near the top. Add the `Place` import alongside the existing component imports (find the block of local component imports, e.g. near where `Quote`, `Sidenote`, `GithubProject` are imported):

```ts
import Place from '@/components/Place'
```

- [ ] **Step 2: Add `Place` to the components map**

In the same file, find the `components` constant (around line 335). It currently ends with:

```ts
  TrainingQuadrantSquare,
}
```

Add `Place` to the map:

```ts
  TrainingQuadrantSquare,
  Place,
}
```

- [ ] **Step 3: Fix the journal entry**

Open `journal/2026-06-02.md`. Line 24 currently reads:

```
The other reason to keep running is to <Place link="https://www.harpandhound.com.au/" instagram="harpandhoundbar">hard and Hound</Place>
```

Fix the typo in the children text ("hard" → "Harp") and complete the sentence:

```
The other reason to keep running is to visit <Place link="https://www.harpandhound.com.au/" instagram="harpandhoundbar">Harp and Hound</Place> for a post-run drink.
```

(Adjust the sentence ending to match what you actually intended to write.)

- [ ] **Step 4: Run the full test suite to confirm nothing is broken**

```bash
npm test
```

Expected: All tests pass, no regressions.

- [ ] **Step 5: Commit**

```bash
git add src/components/MDXWrapper/components.tsx journal/2026-06-02.md
git commit -m "feat: register Place in MDX component map, fix journal entry"
```
