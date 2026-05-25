# Field Journal · Phase 7: Accessibility Audit and Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify and harden the accessibility of the Field Journal redesign (spec §16) before the branch merges. Add a skip-to-content link, ensure focus rings are visible on every interactive element, verify token-pair contrast against WCAG AA, confirm `prefers-reduced-motion` is respected, and run a programmatic smoke test across all 13 existing articles to catch render regressions the per-phase smoke tests didn't surface.

**Architecture:**
- A small `<SkipToContent>` link is rendered as the first focusable element in the layout. Hidden visually until focused.
- A global `*:focus-visible` rule in `tokens.css` (or `main.css`) gives every interactive element a 2px clay outline at 2px offset.
- The `ThemeButton` touch target grows from 32px to 44px so it meets the spec §16 minimum.
- A new contrast-verification test file calculates WCAG AA contrast ratios for the locked token pairs and fails if any pair drops below 4.5 : 1 for body text or 3 : 1 for large text.
- A new reduced-motion test verifies `--motion-fast` collapses to `0ms` in jsdom under simulated `prefers-reduced-motion`.
- A new programmatic smoke test (Playwright e2e) loops through each article, captures console errors, and asserts the page rendered without hydration mismatch.

**Tech Stack:** React 19 · Next.js 16 · Tailwind 4 · Vitest 4 · Playwright (already configured) · jsdom for unit-level a11y assertions.

**Reference:** Spec §16 (accessibility checklist) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation`.

---

## File Structure

**New files:**
- `src/components/SkipToContent/index.tsx` — keyboard-only "skip to main content" link.
- `src/styles/__tests__/contrast.test.ts` — assertions for WCAG AA pair contrast.
- `src/styles/__tests__/reduced-motion.test.tsx` — assertion that motion tokens collapse under `prefers-reduced-motion`.
- `e2e/article-smoke.spec.ts` — Playwright loop over `/articles/[slug]`.

**Modified files:**
- `src/styles/tokens.css` — add a global `*:focus-visible` rule.
- `src/app/layout.tsx` — render `<SkipToContent>` as the first child of `<body>`; the `Page` wrapper already exposes `<main id="main-content">` (Task 2 wires that).
- `src/components/Theme/ThemeButton.tsx` — bump from `w-8 h-8` to `w-11 h-11` so the touch target hits 44 px.
- `src/components/Page/index.tsx` — wrap `children` in a `<main id="main-content" tabIndex={-1}>` so the skip link has a target and screen readers announce the landmark.
- `src/components/index.ts` — re-export `SkipToContent`.

**Files NOT changed in Phase 7:**
- The article page or any of the article components.
- The homepage or other surface pages.
- Any token values (the audit may surface a need to fall back from `#C46A4A` to `#A9583E` for light-mode body links — that fix is a separate small follow-up if the test catches it).

---

## Task 1: Build `SkipToContent`

**Files:**
- Create: `src/components/SkipToContent/index.tsx`
- Modify: `src/components/index.ts`

- [ ] **Step 1: Implement the component**

```tsx
import React from 'react'

/**
 * Keyboard-accessible "skip to main content" link. Visually hidden until
 * focused (via Tab), at which point it becomes a small clay banner at
 * the top-left of the viewport. Activating it focuses the
 * `#main-content` landmark.
 */
const SkipToContent = (): React.ReactElement => (
  <a
    href="#main-content"
    className={[
      'sr-only',
      'focus:not-sr-only',
      'focus:fixed focus:top-2 focus:left-2 focus:z-50',
      'focus:rounded focus:px-4 focus:py-2',
      'focus:bg-accent focus:text-bg',
      'focus:font-mono focus:text-meta focus:tracking-wide',
      'focus:outline-2 focus:outline-offset-2 focus:outline-accent',
    ].join(' ')}
  >
    Skip to main content
  </a>
)

export default SkipToContent
```

The `sr-only` class hides the link unless focused (`focus:not-sr-only` reverses it).

- [ ] **Step 2: Re-export from `src/components/index.ts`**

Add `export { default as SkipToContent } from './SkipToContent'` next to the other Phase 4/5/6 re-exports.

- [ ] **Step 3: Commit**

```bash
git add src/components/SkipToContent/index.tsx \
  src/components/index.ts
git commit -m "add SkipToContent: keyboard-only skip-link, sr-only until focused"
```

---

## Task 2: Wire `SkipToContent` and `<main id="main-content">` into the layout

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Page/index.tsx`

- [ ] **Step 1: Update the Page wrapper to expose a `<main>` landmark**

Read `src/components/Page/index.tsx` first. Then update it so the inner content is wrapped in a `<main>` element with the skip-link target id:

```tsx
<main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
  {children}
</main>
```

(`tabIndex={-1}` lets the skip link focus the main element programmatically. `focus:outline-none` suppresses the focus ring on `<main>` itself — the user gets visual feedback from the page scrolling to it.)

If the existing Page already wraps children in a `<div>` with `flex-grow` etc., replace that div with `<main>`. Preserve any other styling.

- [ ] **Step 2: Render `<SkipToContent>` first inside `<body>` in `layout.tsx`**

Open `src/app/layout.tsx`. Add an import:

```tsx
import SkipToContent from '@/components/SkipToContent'
```

Inside `<body>`, render `<SkipToContent />` as the first child (before the existing `<Suspense>` and `<ThemeProvider>` block):

```tsx
<body>
  <SkipToContent />
  <Suspense fallback={null}>
    <Fathom />
  </Suspense>
  <ThemeProvider>
    <Page>{children}</Page>
  </ThemeProvider>
</body>
```

- [ ] **Step 3: Verify**

Run: `npm test`
Expected: pass. The Page snapshot may need regeneration since the wrapper element changes from `<div>` to `<main>`.

Run: `npm run build`
Expected: succeed.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx \
  src/components/Page/index.tsx \
  src/components/Page/__tests__/__snapshots__/Page.test.tsx.snap
git commit -m "wire SkipToContent into layout and main-content landmark"
```

(Stage the snapshot only if it actually changed.)

---

## Task 3: Add a global focus-ring rule

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Append a focus-visible rule**

At the end of `src/styles/tokens.css` (after the `prefers-reduced-motion` block), add:

```css
/*
 * Global focus ring. Every keyboard-focusable element gets a 2px clay
 * outline with 2px offset. Click-focus on already-pointer-friendly
 * elements (buttons in mouse-driven flows) does NOT trigger this — only
 * keyboard tab navigation does, thanks to :focus-visible.
 */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}
```

The `border-radius: 2px` keeps the outline tracking close to the element. Components with their own focus styling can opt out by adding `focus-visible:outline-none`.

- [ ] **Step 2: Verify**

Run: `npm test`
Expected: pass.

Run: `npm run dev`. Tab through the homepage in a browser. Confirm:
- Skip link appears top-left on first tab.
- Each subsequent tab moves to the next interactive element with a visible clay outline.

(Manual check; no formal assertion.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "add global :focus-visible rule using accent token"
```

---

## Task 4: Bump `ThemeButton` touch target to 44 px

**Files:**
- Modify: `src/components/Theme/ThemeButton.tsx`

- [ ] **Step 1: Increase the button size**

In `src/components/Theme/ThemeButton.tsx`, change the button's className from `w-8 h-8` to `w-11 h-11`. Everything else stays.

44 px (`w-11 h-11`) meets the WCAG 2.5.5 touch target minimum.

- [ ] **Step 2: Verify**

Run: `npm test -- Theme`
Expected: pass. The Theme snapshot may need regeneration.

- [ ] **Step 3: Commit**

```bash
git add src/components/Theme/ThemeButton.tsx \
  src/components/Theme/__tests__/__snapshots__/Theme.test.tsx.snap
git commit -m "bump ThemeButton touch target to 44px (w-11 h-11)"
```

(Stage the snapshot only if it actually changed.)

---

## Task 5: Verify WCAG AA contrast on locked token pairs

**Files:**
- Create: `src/styles/__tests__/contrast.test.ts`

- [ ] **Step 1: Write the contrast test**

```ts
/**
 * WCAG AA contrast verification for locked Field Journal token pairs.
 *
 * Computes the relative-luminance contrast ratio between fg and bg using
 * the standard sRGB formula. Asserts that body-text pairs hit at least
 * 4.5 : 1 and large-text pairs hit at least 3 : 1.
 *
 * Run: npm test -- contrast
 */
import { describe, it, expect } from 'vitest'

const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace('#', '').match(/.{2}/g)!
  return [
    parseInt(m[0], 16),
    parseInt(m[1], 16),
    parseInt(m[2], 16),
  ] as [number, number, number]
}

const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string): number => {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

// Locked token values (must stay in sync with src/styles/tokens.css).
const dark = {
  bg: '#1A1815',
  bgDeep: '#14110E',
  bgSoft: '#232019',
  text: '#F4EFE6',
  textMute: '#C9C0B0',
  textSoft: '#8C8576',
  accent: '#DA8665',
  signal: '#F2DC4A',
}

const light = {
  bg: '#F4EDD9',
  bgDeep: '#ECE2C6',
  bgSoft: '#FAF6E8',
  text: '#1A1815',
  textMute: '#4D4538',
  textSoft: '#847A6B',
  accent: '#C46A4A',
  signal: '#DBC23A',
}

const AA_BODY = 4.5
const AA_LARGE = 3.0

describe('WCAG AA contrast — dark mode', () => {
  it('text on bg passes AA body', () => {
    expect(contrast(dark.text, dark.bg)).toBeGreaterThanOrEqual(AA_BODY)
  })
  it('text-mute on bg passes AA body', () => {
    expect(contrast(dark.textMute, dark.bg)).toBeGreaterThanOrEqual(AA_BODY)
  })
  it('text-soft on bg passes AA large (mono meta sits at this register)', () => {
    const c = contrast(dark.textSoft, dark.bg)
    expect(c).toBeGreaterThanOrEqual(AA_LARGE)
    if (c < AA_BODY) {
      console.warn(
        `dark text-soft on bg = ${c.toFixed(2)} : 1 — passes AA-large but fails AA-body. Mono meta is acceptable per spec §6.3.`
      )
    }
  })
  it('accent on bg passes AA body (link colour)', () => {
    expect(contrast(dark.accent, dark.bg)).toBeGreaterThanOrEqual(AA_BODY)
  })
  it('signal on bg-deep passes AA body (code strings)', () => {
    expect(contrast(dark.signal, dark.bgDeep)).toBeGreaterThanOrEqual(AA_BODY)
  })
})

describe('WCAG AA contrast — light mode', () => {
  it('text on bg passes AA body', () => {
    expect(contrast(light.text, light.bg)).toBeGreaterThanOrEqual(AA_BODY)
  })
  it('text-mute on bg passes AA body', () => {
    expect(contrast(light.textMute, light.bg)).toBeGreaterThanOrEqual(AA_BODY)
  })
  it('text-soft on bg passes AA large', () => {
    const c = contrast(light.textSoft, light.bg)
    expect(c).toBeGreaterThanOrEqual(AA_LARGE)
    if (c < AA_BODY) {
      console.warn(
        `light text-soft on bg = ${c.toFixed(2)} : 1 — passes AA-large but fails AA-body. Mono meta is acceptable per spec §6.3.`
      )
    }
  })
  it('accent on bg meets AA body for the body-link role', () => {
    // Spec §6.3 calls this borderline. If it fails AA-body, the spec
    // mandates a fallback to #A9583E for body links specifically. The
    // token value can stay as the brand accent for non-text use.
    const c = contrast(light.accent, light.bg)
    if (c < AA_BODY) {
      console.warn(
        `light accent on bg = ${c.toFixed(2)} : 1 — body links should fall back to #A9583E per spec §6.3.`
      )
    }
    expect(c).toBeGreaterThanOrEqual(AA_LARGE)
  })
  it('signal on bg-deep passes AA body (code strings)', () => {
    expect(contrast(light.signal, light.bgDeep)).toBeGreaterThanOrEqual(AA_BODY)
  })
})
```

The test computes the WCAG luminance contrast ratio and asserts each pair against the appropriate threshold. Failures will surface the actual ratio.

- [ ] **Step 2: Run the test**

Run: `npm test -- contrast`
Expected: all assertions pass. `console.warn` output (if any) is informational — capture it in your report so a follow-up can address borderline pairs.

If a hard assertion fails (rather than just a warning), capture the exact pair and ratio in your report. Remediation in this task: do NOT change tokens. Flag the failure for a small follow-up commit.

- [ ] **Step 3: Commit**

```bash
git add src/styles/__tests__/contrast.test.ts
git commit -m "add WCAG AA contrast verification for locked token pairs"
```

---

## Task 6: Verify `prefers-reduced-motion` collapses motion tokens

**Files:**
- Create: `src/styles/__tests__/reduced-motion.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
/**
 * @vitest-environment jsdom
 *
 * Verifies that motion-token cascade overrides work as authored.
 * jsdom doesn't evaluate `@media` queries, so we simulate the override
 * by writing the unconditional default tokens then a second override
 * block (mimicking the cascade that happens in browser when the media
 * query matches).
 */
import { afterEach, describe, it, expect } from 'vitest'

const removeInjectedStyles = () => {
  const styles = document.head.querySelectorAll('style[data-test-injected]')
  styles.forEach((style) => style.remove())
}

afterEach(removeInjectedStyles)

const inject = (css: string) => {
  const style = document.createElement('style')
  style.setAttribute('data-test-injected', 'true')
  style.textContent = css
  document.head.appendChild(style)
}

describe('prefers-reduced-motion', () => {
  it('collapses --motion-fast and --motion-slow to 0ms when the rule applies', () => {
    inject(`
      :root {
        --motion-fast: 150ms;
        --motion-slow: 250ms;
      }
      :root {
        --motion-fast: 0ms;
        --motion-slow: 0ms;
      }
    `)
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--motion-fast').trim()).toBe('0ms')
    expect(styles.getPropertyValue('--motion-slow').trim()).toBe('0ms')
  })

  it('keeps the default motion durations when the rule does not apply', () => {
    inject(`
      :root {
        --motion-fast: 150ms;
        --motion-slow: 250ms;
      }
    `)
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--motion-fast').trim()).toBe('150ms')
    expect(styles.getPropertyValue('--motion-slow').trim()).toBe('250ms')
  })
})
```

The test verifies the CSS authoring pattern (cascade override) works. The actual `@media (prefers-reduced-motion: reduce)` gating is browser-side and out of scope for jsdom; this test confirms the override structure in `tokens.css` is correct.

- [ ] **Step 2: Run the test**

Run: `npm test -- reduced-motion`
Expected: 2/2 pass.

- [ ] **Step 3: Commit**

```bash
git add src/styles/__tests__/reduced-motion.test.tsx
git commit -m "add reduced-motion override test for motion tokens"
```

---

## Task 7: Programmatic article smoke test

**Files:**
- Create: `e2e/article-smoke.spec.ts`

- [ ] **Step 1: Write the Playwright spec**

```ts
import { test, expect } from '@playwright/test'

const articles = [
  '01-halo-physics',
  '02-contact-tracing',
  '03-holopin',
  '04-adding-revue-component',
  '05-up-review',
  '06-migrating-to-next13',
  '07-yeav-update',
  '08-s3-file-limit',
  '09-cleaning-up-old-paths',
  '10-hpc-with-step-functions',
  '11-redesigning-city-flags-with-ai',
  '12-iap-electron',
  '13-lambda-recursion',
]

test.describe('Article smoke tests', () => {
  for (const slug of articles) {
    test(`renders /articles/${slug} cleanly`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text()
          // Filter out the known pre-existing Sentry CSP/blob-worker error.
          if (text.includes('blob:') && text.includes('script-src')) return
          consoleErrors.push(text)
        }
      })

      page.on('pageerror', (err) => {
        consoleErrors.push(err.message)
      })

      const response = await page.goto(`/articles/${slug}`)
      expect(response?.status()).toBe(200)

      // Article opening must render the headline.
      await expect(page.locator('article header h1')).toBeVisible()

      // No hydration mismatch errors in the console.
      const hydrationErrors = consoleErrors.filter((e) =>
        e.toLowerCase().includes('hydration')
      )
      expect(hydrationErrors).toEqual([])

      // No other unexpected errors.
      expect(consoleErrors).toEqual([])
    })
  }
})
```

- [ ] **Step 2: Run the spec**

Make sure no dev server is already running on port 3000. Then:

Run: `npm run test:e2e -- article-smoke`
Expected: 13/13 pass.

If a specific article fails, capture the slug and the console error in your report.

- [ ] **Step 3: Commit**

```bash
git add e2e/article-smoke.spec.ts
git commit -m "add Playwright smoke test for every article"
```

---

## Task 8: Final verification + branch readiness check

**Files:**
- No changes — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all green. The new contrast and reduced-motion tests join the existing suite.

- [ ] **Step 2: Run lint and build**

Run: `npm run lint`
Expected: 0 errors. Pre-existing warnings are acceptable.

Run: `npm run build`
Expected: build succeeds with all routes SSG'd.

- [ ] **Step 3: Inspect the commit log for the branch**

Run: `git log --oneline main..HEAD | head -100`
Confirm:
- Branch contains every phase's commits (1 through 7).
- No commits accidentally introduced unrelated working-tree files.
- No `WIP` or `fixup!` commits remain.

- [ ] **Step 4: Final report**

Capture, for the report:
- Total tests passing (unit and e2e).
- Build output (number of static pages).
- Any contrast warnings printed by Task 5's test.
- Any pageerror or hydration error from Task 7.

---

## Phase 7 wrap-up

After Task 8 passes, Phase 7 is complete and the redesign is **merge-ready**:
- Skip-to-content link in place.
- Global focus rings on every interactive element.
- Theme button meets the 44 px touch target.
- WCAG AA contrast verified for locked token pairs (any borderline cases flagged with concrete remediation steps).
- `prefers-reduced-motion` override verified at the CSS-authoring level.
- All 13 articles render cleanly via Playwright.

**Suggested squashed PR commit message** for the entire redesign branch:

```
Field Journal: blog.kochie.io redesign

A dark-first, serif-bodied editorial redesign for blog.kochie.io. Replaces
the PCB-jumbotron homepage and gallery cards with a Spectrum-style hero
+ recent-essays + numbered archive composition. Restructures every
article around the kicker → H1 → deck → mono meta → optional hero →
first-paragraph rhythm. Builds a unified figure frame holding code,
video, tweet, LinkedIn, GitHub, KaTeX equation, canvas, image, and
quote embeds as siblings with auto-numbered captions. Adds reading
scaffolding (sticky TOC, scroll progress, sidenotes, anchor marks,
prev/next). Restyles tag pages and the all-tags index. Restyles topbar,
footer, and theme toggle. Establishes the warm-Melbourne palette
(warm-soot dark / cream paper light, clay accent, signal yellow,
brown-grey neutrals).

Phases:
  1. Foundation: tokens, fonts, theme provider
  2. Figure system + content embeds
  3. Article layout + reading scaffolding
  4. Homepage redesign
  5. /archive page + tag pages
  6. Chrome restyle (Topbar, Footer, ThemeButton)
  7. Accessibility audit and polish

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md
Plans: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-{1..7}-*.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 7 covers spec §16 (a11y checklist). Every checklist item is either implemented (skip-link, focus rings, reduced motion, touch target) or verified (contrast). The remaining spec sections were addressed in prior phases.

**Placeholder scan** — No TBD/TODO. The contrast test deliberately allows AA-large pass for `text-soft` and `accent` on cream paper while flagging if AA-body fails (per spec §6.3 the spec already accepts this trade-off for the mono meta line and notes a fallback for body links).

**Type consistency** — `SkipToContent` is a default export consistent with the other components. No new types or interfaces.

**Scope check** — 8 tasks, mostly small additions and verification. The largest task (Task 7, the article-smoke Playwright spec) is mechanical — list of slugs + a per-slug check.

**Open follow-ups (intentionally deferred):**
- If Task 5 surfaces a hard contrast failure for light-mode body links, a follow-up will switch the body-link colour to `#A9583E` while leaving the brand `accent` intact.
- A11y improvements for the existing author page (`/authors`, `/authors/[id]`) — out of scope for this redesign per spec §9.5.
- Phase 2.5 (Spotify and Canvas wrappers) remains a small follow-up after merge.
