# Field Journal · Phase 6: Chrome Restyle

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy chrome (grey Topbar, dark-Saas Footer, fixed-position ThemeButton) with the Field Journal-aligned Topbar (logo lockup with the `/` slash in clay, sans nav, integrated theme toggle), Footer (warm soot, mono links, "Part of Kochie Engineering →" attribution line), and a simplified inline ThemeButton suitable for the topbar.

**Architecture:**
- `Topbar` rewritten end-to-end. Logo lockup on the left, sans nav on the right, theme toggle as the rightmost item. Sticky to top of viewport. `bg-bg` with a hairline `border-rule` below.
- `Footer` rewritten. Single-bg surface (`bg-bg-soft` for subtle separation from page bg). Mono links. Three-column grid. Dynamic copyright year. "Part of Kochie Engineering →" line at the top.
- `TrackedLink` restyled to use new tokens (mono text, `text-text-mute` default, `text-accent` on hover).
- `ThemeButton` simplified for inline topbar use. Single icon (the active mode), single click cycles dark → light → system → dark. The fixed-position top-right overlay is removed.
- `layout.tsx` no longer renders the floating `ThemeButton` — the topbar contains it.
- `Topbar.module.css` retired.

**Tech Stack:** React 19 · Next.js 16 App Router · `next/link` · Tailwind 4 (Phase 1 tokens) · `@fortawesome/react-fontawesome` (already in use) · Vitest 4 + RTL.

**Reference:** Spec §9.1 (homepage chrome — applies to all pages), §17 (retired patterns) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation`.

---

## File Structure

**Modified files:**
- `src/components/Topbar/index.tsx` — full rewrite.
- `src/components/Topbar/Topbar.module.css` — delete (no longer referenced).
- `src/components/Footer/twui-footer.tsx` — full rewrite.
- `src/components/Footer/TrackedLink.tsx` — restyle with new tokens.
- `src/components/Theme/ThemeButton.tsx` — simplify to a single inline icon button.
- `src/app/layout.tsx` — drop the standalone `ThemeButton` rendering (Topbar now hosts it).

**Files NOT changed in Phase 6:**
- The article page or any of the article components.
- The homepage / archive / tags pages.
- The Theme provider context (`Theme/context.tsx`) — only the button presentation changes.
- The MDX pipeline.

---

## Task 1: Restyle `Topbar`

**Files:**
- Modify: `src/components/Topbar/index.tsx`
- Delete: `src/components/Topbar/Topbar.module.css`

- [ ] **Step 1: Replace the Topbar component**

Replace the entire contents of `src/components/Topbar/index.tsx` with:

```tsx
import React, { type ReactElement } from 'react'
import Link from 'next/link'
import { ThemeButton } from '@/components/Theme'

const Topbar = (): ReactElement => {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-rule">
      <div className="mx-auto max-w-bleed px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-semibold text-text leading-none text-lg hover:text-accent transition-colors duration-fast"
        >
          Kochie Engineering <span className="text-accent">/</span> Blog
        </Link>
        <nav className="flex items-center gap-6 font-sans text-ui text-text-mute">
          <Link href="/archive" className="hover:text-accent transition-colors duration-fast">
            Archive
          </Link>
          <Link href="/tags" className="hover:text-accent transition-colors duration-fast">
            Tags
          </Link>
          <Link href="/authors" className="hover:text-accent transition-colors duration-fast">
            Authors
          </Link>
          <a
            href="/feed/rss.xml"
            className="hover:text-accent transition-colors duration-fast"
          >
            RSS
          </a>
          <ThemeButton />
        </nav>
      </div>
    </header>
  )
}

export default Topbar
```

Key changes:
- Sticky to viewport top (was fixed). `bg-bg/95 backdrop-blur` keeps it readable while letting the page show through.
- Logo lockup: `Kochie Engineering / Blog` with the slash in clay (per spec §9.1).
- Nav: Archive, Tags, Authors, RSS — replacing the old Authors/Articles/Tags. "Articles" goes away because the logo links home (which is the article index).
- ThemeButton inlined as the rightmost item.
- The old `Topbar.module.css` is no longer imported.

- [ ] **Step 2: Delete the unused CSS module**

Run `git rm src/components/Topbar/Topbar.module.css`.

- [ ] **Step 3: Run Topbar tests**

Run: `npm test -- Topbar`
Expected: pass. If snapshot test stales, regenerate.

- [ ] **Step 4: Commit**

```bash
git add src/components/Topbar/index.tsx \
  src/components/Topbar/Topbar.module.css \
  src/components/Topbar/__tests__/__snapshots__/Topbar.test.tsx.snap
git commit -m "restyle Topbar: logo lockup, sans nav, integrated theme toggle"
```

(Stage the snapshot only if it actually changed.)

---

## Task 2: Simplify `ThemeButton` for inline use

**Files:**
- Modify: `src/components/Theme/ThemeButton.tsx`

- [ ] **Step 1: Replace ThemeButton with a single inline icon button**

Replace the entire contents of `src/components/Theme/ThemeButton.tsx` with:

```tsx
'use client'
import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLightbulbSlash,
  faLightbulbOn,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'

import { THEME, useTheme } from './context'

const labels: Record<THEME, string> = {
  [THEME.dark]: 'Theme: dark · click for light',
  [THEME.light]: 'Theme: light · click for system',
  [THEME.system]: 'Theme: system · click for dark',
}

const nextTheme = (theme: THEME): THEME => {
  if (theme === THEME.dark) return THEME.light
  if (theme === THEME.light) return THEME.system
  return THEME.dark
}

const ThemeButton = () => {
  const [theme, setTheme] = useTheme()

  const icon =
    theme === THEME.dark
      ? faLightbulbSlash
      : theme === THEME.light
        ? faLightbulbOn
        : faCogs

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme(theme))}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="inline-flex items-center justify-center w-8 h-8 rounded text-text-mute hover:text-accent transition-colors duration-fast"
    >
      <FontAwesomeIcon icon={icon} className="text-base" />
    </button>
  )
}

export default ThemeButton
```

Key changes:
- Single icon, single button. The hover-reveals-three-options behavior is gone.
- Cycles dark → light → system → dark.
- aria-label and title describe both current state and the next state.
- No more fixed-position styling — sized for inline use.

- [ ] **Step 2: Run Theme tests**

Run: `npm test -- Theme`
Expected: most tests still pass. The cycle test from Phase 1 (T8) asserts on the cycle order which is unchanged. The render snapshot for `ThemeButton` is now different — regenerate it.

- [ ] **Step 3: Commit**

```bash
git add src/components/Theme/ThemeButton.tsx \
  src/components/Theme/__tests__/__snapshots__/Theme.test.tsx.snap
git commit -m "simplify ThemeButton: single inline icon, cycle dark → light → system"
```

(Stage the snapshot only if it actually changed.)

---

## Task 3: Drop the floating ThemeButton from `layout.tsx`

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Remove the standalone `<ThemeButton />` from the layout**

In `src/app/layout.tsx`, find the `<ThemeProvider>` block. It currently contains both `<ThemeButton />` and `<Page>`:

```tsx
<ThemeProvider>
  <ThemeButton />
  <Page>{children}</Page>
</ThemeProvider>
```

Remove the `<ThemeButton />` line (the Topbar now hosts it). Also remove the `ThemeButton` from the `@/components/Theme` import if it's no longer used here.

The updated block should be:

```tsx
<ThemeProvider>
  <Page>{children}</Page>
</ThemeProvider>
```

And the import line at the top changes from:

```tsx
import { ThemeProvider, ThemeButton } from '@/components/Theme'
```

to:

```tsx
import { ThemeProvider } from '@/components/Theme'
```

- [ ] **Step 2: Run tests + build**

Run: `npm test`
Expected: pass.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "drop floating ThemeButton from root layout (now in Topbar)"
```

---

## Task 4: Restyle `TrackedLink`

**Files:**
- Modify: `src/components/Footer/TrackedLink.tsx`

- [ ] **Step 1: Update the tracked-link styling**

Replace `src/components/Footer/TrackedLink.tsx` with:

```tsx
'use client'

import { trackEvent } from 'fathom-client'
import Link from 'next/link'

export default function TrackedLink({
  href,
  name,
}: {
  href: string
  name: string
}) {
  return (
    <Link
      href={href}
      className="font-mono text-meta tracking-wide text-text-mute hover:text-accent transition-colors duration-fast"
      onClick={() => trackEvent(name)}
    >
      {name}
    </Link>
  )
}
```

Token-aware colours, mono text matching the rest of the chrome.

- [ ] **Step 2: Verify**

Run: `npm test`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer/TrackedLink.tsx
git commit -m "restyle TrackedLink to mono token-aware link"
```

---

## Task 5: Restyle `Footer`

**Files:**
- Modify: `src/components/Footer/twui-footer.tsx`

- [ ] **Step 1: Replace the Footer**

Replace the entire contents of `src/components/Footer/twui-footer.tsx` with:

```tsx
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  faBluesky,
  faGithub,
  faMastodon,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Logo from './blog-logo.svg'
import TrackedLink from './TrackedLink'

const navigation = {
  affiliates: [{ name: 'Blogroll', href: 'https://blogroll.org/' }],
  friends: [
    { name: 'Hugo', href: 'https://hugo.md' },
    { name: 'Terence', href: 'https://terencehuynh.com/' },
    { name: 'Nicholas', href: 'https://nicholas.cloud/' },
    { name: 'Eric', href: 'https://ericjiang.dev/' },
    { name: 'Daniel', href: 'https://daniel.st/' },
    { name: 'Matt', href: 'https://mattseymour.substack.com/' },
  ],
  links: [
    { name: 'Me', href: 'https://me.kochie.io' },
    { name: 'Linkedin', href: 'https://linkedin.com/in/rkkochie' },
    {
      name: 'RSS',
      href: `https://${
        process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      }/feed/rss.xml`,
    },
  ],
  social: [
    {
      name: 'Bluesky',
      href: 'https://bsky.app/profile/kochie.bsky.social',
      icon: faBluesky,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/kochie',
      icon: faTwitter,
    },
    {
      name: 'Github',
      href: 'https://github.com/kochie',
      icon: faGithub,
    },
    {
      name: 'Mastodon',
      href: 'https://melb.social/@kochie',
      icon: faMastodon,
    },
  ],
}

interface FooterProps {
  title: string
  description: string
}

export function Footer({ title, description }: FooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer
      aria-labelledby="footer-heading"
      className="mt-24 bg-bg-soft border-t border-rule"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-bleed px-4 py-12">
        {/* Brand attribution */}
        <Link
          href="https://kochie.io"
          className="font-mono text-meta tracking-wide text-text-soft hover:text-accent transition-colors duration-fast"
        >
          {'// '}Part of Kochie Engineering →
        </Link>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-8 md:gap-12">
          {/* Brand block */}
          <div>
            <Image src={Logo} alt={title} className="h-10 w-auto" />
            <p className="mt-4 font-serif italic text-body-sm text-text-mute leading-snug max-w-prose">
              {description}
            </p>
            <div className="mt-6 flex gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text-mute hover:text-accent transition-colors duration-fast"
                >
                  <span className="sr-only">{item.name}</span>
                  <FontAwesomeIcon icon={item.icon} size="lg" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Affiliates */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Affiliates
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.affiliates.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Friends */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Friends
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.friends.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Links
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.links.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-rule font-mono text-meta tracking-wide text-text-soft">
          © {year} {title}
        </div>
      </div>
    </footer>
  )
}
```

Key changes:
- `bg-bg-soft` (warm) replaces hardcoded `#222222`. Subtle separation from page bg via `border-t border-rule`.
- Brand attribution line at the very top: `// Part of Kochie Engineering →` (mono, links to kochie.io).
- Section headers use mono `// Affiliates` style instead of bold sans.
- `text-gray-300` / `text-gray-400` / `text-white` all replaced with `text-text-mute` / `text-text-soft`.
- Copyright year is dynamic (the old hardcoded "2020" is gone).
- Social icons restyled with `text-text-mute hover:text-accent`.
- Decorative double-rule (`border-t … pt-8 sm:mt-20 lg:mt-24`) replaced with a simpler hairline rule above the copyright.
- `faCopyright` import removed; the `©` glyph is just text now.

- [ ] **Step 2: Run Footer tests**

Run: `npm test -- Footer`
Expected: pass. Regenerate the snapshot if it stales.

- [ ] **Step 3: Run build to confirm**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer/twui-footer.tsx \
  src/components/Footer/__tests__/__snapshots__/Footer.test.tsx.snap
git commit -m "restyle Footer: warm soot, mono links, dynamic year, brand attribution"
```

(Stage the snapshot only if it actually changed.)

---

## Task 6: Smoke test on every restyled surface

**Files:**
- No changes — verification only.

- [ ] **Step 1: Run `npm test` and `npm run build`**

Both should pass cleanly.

- [ ] **Step 2: Run dev server and visit each page**

Run: `npm run dev`

Visit:
- `http://localhost:3000` — homepage. Topbar at top with logo + nav + theme toggle. Footer at the foot.
- `http://localhost:3000/archive` — archive page. Same chrome.
- `http://localhost:3000/tags` — tags index. Same chrome.
- `http://localhost:3000/tags/cdk` — tag page. Same chrome.
- `http://localhost:3000/articles/13-lambda-recursion` — article page. Same chrome.

Visual / behaviour checks (no formal assertions; eyeball + interact):
- Topbar matches the page bg (warm soot in dark, cream in light) with a hairline border below.
- Logo "Kochie Engineering / Blog" with the slash in clay; clicking it navigates home.
- Nav links: Archive, Tags, Authors, RSS. Each clickable.
- Theme toggle is the rightmost nav item. Clicking cycles dark → light → system.
- Footer attribution line "// Part of Kochie Engineering →" links to kochie.io.
- Footer no longer renders against `#222222`; it's `bg-bg-soft` and feels integrated with the page.
- Copyright year is the current year (2026), not "2020".
- No floating fixed-position theme button overlapping content.
- No hydration errors. Only the pre-existing Sentry CSP/blob-worker error.

If a check fails, capture precisely (URL, element, console message) and report — Phase 6 ends here; any follow-on fix is its own commit.

- [ ] **Step 3: Stop the dev server.**

- [ ] **Step 4: No commit needed for verification.**

---

## Phase 6 wrap-up

After Task 6 passes, Phase 6 is complete:
- Topbar restyled: logo lockup + sans nav + integrated theme toggle.
- Footer restyled: warm soot, mono links, dynamic year, brand attribution.
- ThemeButton simplified to a single inline icon button.
- Floating fixed-position theme button is gone.

All five page templates (homepage, archive, tags index, tag page, article) now feel like one cohesive design. The chrome no longer drags down the rest of the work.

**Suggested squashed PR commit message:**

```
Field Journal · Phase 6: chrome restyle

- Topbar: sticky logo lockup ("Kochie Engineering / Blog" with clay slash), sans nav (Archive · Tags · Authors · RSS), integrated theme toggle
- Footer: warm soot bg, mono-section headers, "// Part of Kochie Engineering" brand attribution, dynamic copyright year
- ThemeButton simplified to single inline icon, click cycles dark → light → system
- Removed floating fixed-position theme button from root layout
- TrackedLink restyled to mono with token-aware colours

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §9.1, §17
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-6-chrome.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 6 covers spec §9.1 (chrome) and §17 (retired patterns: the floating theme button is one). The remaining items in §17 (retired terminal-green, the literal Lato font, etc.) were retired in earlier phases.

**Placeholder scan** — No TBD/TODO. Snapshot regen guidance is concrete (regenerate only if test fails). The ThemeButton's a11y label uses concrete strings.

**Type consistency** — `ThemeButton` exports as default; the Topbar's import matches. The `THEME` enum continues to have `dark | light | system`. The `nextTheme` cycle order matches what Phase 1 Task 8's tests asserted.

**Scope check** — 6 tasks. Each touches a small surface. The Footer rewrite (Task 5) is the largest change but stays in one file and preserves the navigation data.

**Open follow-ups (deferred):**
- The Topbar's RSS link points to `/feed/rss.xml`. Confirm during smoke test that this URL exists in the build output (it should — the `feed.ts` lib generates it).
- The Footer's "© 2026 Kochie Engineering" line could include the date span ("2020-2026") for accuracy. Phase 7 polish.
- The "Authors" nav item still uses the existing author page (out of scope for this redesign per spec §9.5).
