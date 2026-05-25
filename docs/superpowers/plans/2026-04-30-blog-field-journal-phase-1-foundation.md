# Field Journal · Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Field Journal design foundation — new colour and typography tokens, font swap, dark-by-default theme — without yet restyling individual components. After this phase the site renders with the new palette and fonts but uses old layouts. Subsequent phases (Figure system, Article layout, Homepage, etc.) build on this.

**Architecture:** Tokens live as CSS custom properties on `:root` (dark default) and `[data-theme="light"]` (light overrides). Tailwind 4 surfaces them via `theme.extend.colors` referencing the custom properties, so `bg-bg`, `text-accent`, `text-text-mute`, etc. swap automatically with the theme. The Theme provider sets `data-theme` on the document root and keeps the existing `dark` body class for any Tailwind `dark:` variants still in use. Fonts are loaded via `next/font/google` (Source Serif 4, Geist Sans, Geist Mono); Lato is removed.

**Tech Stack:** Next.js 16 App Router · Tailwind 4 (`@tailwindcss/postcss`) · `next/font/google` · Vitest 4 + React Testing Library · existing ThemeProvider in `src/components/Theme/context.tsx`.

**Reference:** The full design spec is at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`. Token values come from §6, type stack from §7.

**Branch recommendation:** Run this plan on a feature branch (`field-journal/phase-1-foundation`). Each commit is small enough to review in isolation; the whole phase merges to main once visual verification passes.

---

## File Structure

**New files:**

- `src/styles/tokens.css` — All Field Journal design tokens. Both light and dark variants.
- `src/styles/__tests__/tokens.test.tsx` — Tests for token resolution and theme switching.
- `src/components/Theme/__tests__/context.test.tsx` — New tests for `data-theme` attribute behaviour. (May supplement existing tests.)

**Modified files:**

- `src/styles/main.css` — Imports `tokens.css`, removes obsolete CSS custom properties.
- `tailwind.config.cjs` — Surfaces tokens via `theme.extend.colors`, `fontFamily`, `fontSize`, `maxWidth`.
- `src/app/layout.tsx` — Loads Source Serif 4 (body), Geist Sans (UI), Geist Mono (mono). Removes Lato.
- `src/components/Theme/context.tsx` — Sets `data-theme` attribute on `documentElement`. Default theme is `dark` (was `system` defaulting to light).

**Files explicitly NOT changed in Phase 1:**

- Article, Jumbotron, Topbar, Footer, Card, Tag, ArticleCards, Gallery, all MDX wrappers — these stay visually-current; Phase 2-6 restyle each.
- The CSS files in `src/styles/*.module.css` — module CSS is component-scoped and is updated in the relevant component's phase.

---

## Task 1: Create the design-token stylesheet

**Files:**

- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write the new token stylesheet**

Create `src/styles/tokens.css`:

```css
/*
 * Field Journal · design tokens
 * Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §6
 *
 * Default mode is dark. Light mode is applied via [data-theme="light"]
 * on the documentElement (set by Theme provider).
 */

:root {
  /* ─── Surfaces ─── */
  --color-bg:       #1A1815; /* warm soot · page background */
  --color-bg-deep:  #14110E; /* code blocks, raised cards */
  --color-bg-soft:  #232019; /* subtle elevations, callouts, sidenotes */

  /* ─── Text ─── */
  --color-text:      #F4EFE6; /* primary */
  --color-text-mute: #C9C0B0; /* decks, secondary */
  --color-text-soft: #8C8576; /* captions, mono meta, tertiary */

  /* ─── Accents ─── */
  --color-accent: #DA8665; /* clay · links, diagram strokes, hover, kicker numbers */
  --color-signal: #F2DC4A; /* spotlight only */

  /* ─── Hairlines and neutrals ─── */
  --color-rule:           rgba(244, 239, 230, 0.08);
  --color-steel-warm-700: #58504A;
  --color-steel-warm-500: #8C8576;
  --color-steel-warm-300: #C9C0B0;

  /* ─── Reading layout ─── */
  --width-prose: 40rem;    /* 640px · default text column */
  --width-wide:  55rem;    /* 880px · code, equations, GitHub cards */
  --width-bleed: 67.5rem;  /* 1080px · hero figures, canvases */
  --width-site:  75rem;    /* 1200px · chrome max */

  /* ─── Motion ─── */
  --motion-fast:  150ms;
  --motion-slow:  250ms;
  --motion-ease:  cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme="light"] {
  /* ─── Surfaces ─── */
  --color-bg:       #F4EDD9; /* cream paper */
  --color-bg-deep:  #ECE2C6;
  --color-bg-soft:  #FAF6E8;

  /* ─── Text ─── */
  --color-text:      #1A1815;
  --color-text-mute: #4D4538;
  --color-text-soft: #847A6B;

  /* ─── Accents ─── */
  --color-accent: #C46A4A; /* clay (deeper for AA on cream) */
  --color-signal: #DBC23A; /* mustardier for legibility on cream */

  /* ─── Hairlines and neutrals ─── */
  --color-rule:           rgba(26, 24, 21, 0.12);
  /* steel tokens stay constant — they are deliberately mode-agnostic */
}

/* Reduced motion respect */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-fast: 0ms;
    --motion-slow: 0ms;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "add Field Journal design tokens stylesheet"
```

---

## Task 2: Wire tokens into the build

**Files:**

- Modify: `src/styles/main.css`

- [ ] **Step 1: Replace `src/styles/main.css` with this content**

```css
@import 'tailwindcss';
@import './tokens.css';
@config "../../tailwind.config.cjs";

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family:
    'Source Serif 4', 'Iowan Old Style', 'Source Serif Pro', Georgia, serif;
}

/* Legacy grayscale helpers retained — used by unrelated components */
.grayscale-custom { --tw-grayscale: grayscale(0.5); }
.grayscale-70     { --tw-grayscale: grayscale(0.7); }
.grayscale-30     { --tw-grayscale: grayscale(0.3); }
```

The previous `:root` and `.dark-theme` blocks are deleted — every var they defined is superseded by `tokens.css`. Existing components that read those legacy vars will break visually until Phase 2-6 restyles them; that is expected and intentional. The site will still build and render.

- [ ] **Step 2: Run dev server and verify the site builds**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000 without compile errors. Page renders (will look mostly broken — that's expected; legacy components reference vars that no longer exist, fall back to defaults).

Stop the server (Ctrl-C).

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "wire Field Journal tokens into main stylesheet"
```

---

## Task 3: Test that tokens resolve correctly

**Files:**

- Create: `src/styles/__tests__/tokens.test.tsx`

- [ ] **Step 1: Write the failing token-resolution test**

Create `src/styles/__tests__/tokens.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../tokens.css'

describe('Field Journal design tokens', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark mode tokens on :root', () => {
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--color-bg').trim()).toBe('#1A1815')
    expect(styles.getPropertyValue('--color-text').trim()).toBe('#F4EFE6')
    expect(styles.getPropertyValue('--color-accent').trim()).toBe('#DA8665')
    expect(styles.getPropertyValue('--color-signal').trim()).toBe('#F2DC4A')
  })

  it('switches to light tokens when data-theme="light" is set', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--color-bg').trim()).toBe('#F4EDD9')
    expect(styles.getPropertyValue('--color-text').trim()).toBe('#1A1815')
    expect(styles.getPropertyValue('--color-accent').trim()).toBe('#C46A4A')
  })

  it('exposes width tokens', () => {
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--width-prose').trim()).toBe('40rem')
    expect(styles.getPropertyValue('--width-wide').trim()).toBe('55rem')
    expect(styles.getPropertyValue('--width-bleed').trim()).toBe('67.5rem')
  })
})
```

- [ ] **Step 2: Run the test to confirm it passes**

Run: `npm test -- tokens`
Expected: 3 tests pass.

If jsdom does not resolve CSS custom properties from `@import`-ed files, the test may need an `import './tokens.css'` workaround (already included). If issues persist, switch to inlining the token values into a `<style>` element inside the test setup.

- [ ] **Step 3: Commit**

```bash
git add src/styles/__tests__/tokens.test.tsx
git commit -m "test Field Journal token resolution and theme switching"
```

---

## Task 4: Surface tokens through Tailwind config

**Files:**

- Modify: `tailwind.config.cjs`

- [ ] **Step 1: Replace `tailwind.config.cjs` content**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/articles/**/*.mdx',
    './articles/**/*.mdx',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--color-bg)',
        'bg-deep': 'var(--color-bg-deep)',
        'bg-soft': 'var(--color-bg-soft)',
        text:        'var(--color-text)',
        'text-mute': 'var(--color-text-mute)',
        'text-soft': 'var(--color-text-soft)',
        accent: 'var(--color-accent)',
        signal: 'var(--color-signal)',
        rule:   'var(--color-rule)',
        'steel-warm-700': 'var(--color-steel-warm-700)',
        'steel-warm-500': 'var(--color-steel-warm-500)',
        'steel-warm-300': 'var(--color-steel-warm-300)',
      },
      fontFamily: {
        serif: [
          'Source Serif 4',
          'Iowan Old Style',
          'Source Serif Pro',
          'Georgia',
          'serif',
        ],
        sans: [
          'Geist',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      fontSize: {
        'display-hero': ['3.75rem', { lineHeight: '1.02', fontWeight: '600' }],
        'display-h1':   ['2.75rem', { lineHeight: '1.05', fontWeight: '600' }],
        h2:             ['1.75rem', { lineHeight: '1.15', fontWeight: '600' }],
        h3:             ['1.25rem', { lineHeight: '1.30', fontWeight: '600' }],
        deck:           ['1.1875rem', { lineHeight: '1.45', fontWeight: '400' }],
        body:           ['1.0625rem', { lineHeight: '1.70', fontWeight: '400' }],
        'body-sm':      ['0.9375rem', { lineHeight: '1.55', fontWeight: '400' }],
        meta:           ['0.75rem',   { lineHeight: '1.50', fontWeight: '500' }],
        ui:             ['0.875rem',  { lineHeight: '1.50', fontWeight: '500' }],
      },
      maxWidth: {
        prose: 'var(--width-prose)',
        wide:  'var(--width-wide)',
        bleed: 'var(--width-bleed)',
        site:  'var(--width-site)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        ease: 'var(--motion-ease)',
      },
      transitionDelay: {
        0: '0ms',
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out 5',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-in': 'bounce-in 0.5s ease-in-out both',
        'bounce-out': 'bounce-out 0.5s ease-in-out both',
        'bounce-orig': 'bounceOrig 1s linear infinite',
        'load-in': 'load-in 0.5s linear',
      },
      keyframes: {
        bounceOrig: {
          '0%':   { transform: 'translateY(0)' },
          '25%':  { transform: 'translateY(5%)' },
          '50%':  { transform: 'translateY(0)' },
          '75%':  { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%':      { transform: 'rotate(5deg)' },
        },
        'load-in': {
          from: { visibility: 'hidden' },
          to:   { visibility: 'visible' },
        },
        'bounce-in': {
          from:  { opacity: 0 },
          '0%':  { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
          '20%': { transform: 'scale3d(1.1, 1.1, 1.1)' },
          '40%': { transform: 'scale3d(0.9, 0.9, 0.9)' },
          '60%': { opacity: 1, transform: 'scale3d(1.03, 1.03, 1.03)' },
          '80%': { transform: 'scale3d(0.97, 0.97, 0.97)' },
          to:    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
        },
        'bounce-out': {
          from:  { opacity: 1 },
          '20%': { transform: 'scale3d(0.9, 0.9, 0.9)' },
          '55%': { opacity: 1, transform: 'scale3d(1.1, 1.1, 1.1)' },
          to:    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
```

Notable changes:
- `darkMode` switched from `'class'` to `['selector', '[data-theme="dark"]']`. This makes `dark:` Tailwind variants trigger when `data-theme="dark"` is set on a parent (the documentElement). Note: existing usages of `dark:bg-foo` continue to work as long as the provider sets the attribute correctly.
- `colors` references CSS custom properties so theme switching is automatic — `bg-bg`, `text-accent`, `border-rule` all swap with the data-theme attribute.
- Existing animations/keyframes preserved verbatim.
- Added `articles/**/*.mdx` to content paths since the codebase has both `articles/` (top-level) and `public/articles/` patterns.

- [ ] **Step 2: Run dev server and confirm Tailwind compiles**

Run: `npm run dev`
Expected: Server starts without errors. Tailwind processes the new tokens. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.cjs
git commit -m "expose Field Journal tokens via Tailwind theme"
```

---

## Task 5: Test Tailwind utility classes resolve to tokens

**Files:**

- Create: `src/styles/__tests__/tailwind-tokens.test.tsx`

- [ ] **Step 1: Write the test**

Create `src/styles/__tests__/tailwind-tokens.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 *
 * Smoke test: verify Tailwind utility classes wired through tokens
 * apply the expected CSS custom property references. We do NOT run
 * Tailwind compilation in tests — instead we verify the config object
 * shape so a future refactor doesn't silently break the token bridge.
 */
import { describe, it, expect } from 'vitest'
import config from '../../../tailwind.config.cjs'

describe('Tailwind token bridge', () => {
  const colors = config.theme.extend.colors as Record<string, string>

  it('exposes the core surface tokens', () => {
    expect(colors.bg).toBe('var(--color-bg)')
    expect(colors['bg-deep']).toBe('var(--color-bg-deep)')
    expect(colors['bg-soft']).toBe('var(--color-bg-soft)')
  })

  it('exposes the text tokens', () => {
    expect(colors.text).toBe('var(--color-text)')
    expect(colors['text-mute']).toBe('var(--color-text-mute)')
    expect(colors['text-soft']).toBe('var(--color-text-soft)')
  })

  it('exposes the accent and signal tokens', () => {
    expect(colors.accent).toBe('var(--color-accent)')
    expect(colors.signal).toBe('var(--color-signal)')
  })

  it('exposes the rule and steel-warm tokens', () => {
    expect(colors.rule).toBe('var(--color-rule)')
    expect(colors['steel-warm-700']).toBe('var(--color-steel-warm-700)')
  })

  it('uses data-theme="dark" as the dark-mode selector', () => {
    expect(config.darkMode).toEqual(['selector', '[data-theme="dark"]'])
  })

  it('exposes the three width tiers as max-width tokens', () => {
    const maxWidth = config.theme.extend.maxWidth as Record<string, string>
    expect(maxWidth.prose).toBe('var(--width-prose)')
    expect(maxWidth.wide).toBe('var(--width-wide)')
    expect(maxWidth.bleed).toBe('var(--width-bleed)')
  })

  it('exposes serif, sans, and mono font families', () => {
    const ff = config.theme.extend.fontFamily as Record<string, string[]>
    expect(ff.serif[0]).toBe('Source Serif 4')
    expect(ff.sans[0]).toBe('Geist')
    expect(ff.mono[0]).toBe('Geist Mono')
  })
})
```

- [ ] **Step 2: Run the test**

Run: `npm test -- tailwind-tokens`
Expected: 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/styles/__tests__/tailwind-tokens.test.tsx
git commit -m "test Tailwind token bridge configuration"
```

---

## Task 6: Swap fonts — drop Lato, load Source Serif 4 + Geist + Geist Mono

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update font imports and `Page` wrapper**

Replace the contents of `src/app/layout.tsx` with the following. Note the changes are isolated to the font block and the `Page` wrapper — metadata/Sentry/Theme are untouched.

```tsx
import React, { ReactNode, Suspense } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import {
  Source_Serif_4 as SourceSerif4,
  Geist,
  Geist_Mono as GeistMono,
} from 'next/font/google'
import type { Metadata, Viewport } from 'next'

import '@/styles/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css'

import { Fathom, Topbar } from '@/components'
import { Footer } from '@/components/Footer/twui-footer'
import { ThemeProvider, ThemeButton } from '@/components/Theme'

config.autoAddCss = false

const sourceSerif = SourceSerif4({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const geistMono = GeistMono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const description =
  'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.'

export const viewport: Viewport = {
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A1815',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://blog.kochie.io'),
    title: {
      default: 'Kochie Engineering',
      template: '%s | Kochie Engineering',
    },
    description,
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': '/feed/rss',
      },
    },
    manifest: '/manifest.json',
    creator: 'Robert Koch',
    authors: [{ name: 'Robert Koch' }],
    openGraph: {
      type: 'website',
      locale: 'en-AU',
      url: '/',
      siteName: 'Kochie Engineering',
      title: 'Kochie Engineering',
      description,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@kochie',
      creatorId: '90334112',
      site: '@kochie',
      description,
    },
    icons: {
      icon: [
        { url: '/images/icons/blog-logo-128.png', sizes: '128x128', type: 'image/png' },
        { url: '/images/icons/blog-logo-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/images/icons/blog-logo-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [],
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontVars = `${sourceSerif.variable} ${geistSans.variable} ${geistMono.variable}`
  return (
    <html lang="en" className={fontVars} data-theme="dark" suppressHydrationWarning>
      <head />
      <body>
        <Suspense fallback={null}>
          <Fathom />
        </Suspense>
        <ThemeProvider>
          <ThemeButton />
          <Page>{children}</Page>
        </ThemeProvider>
      </body>
    </html>
  )
}

const Page = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden font-serif">
      <Topbar />
      <div className="flex-grow">{children}</div>
      <Footer title="Kochie Engineering" description={description} />
    </div>
  )
}
```

Key changes:
- Lato import replaced with `Source_Serif_4`, `Geist`, `Geist_Mono`. All three loaded with `next/font/google` so they self-host and auto-preload.
- Each font exposes a CSS variable (`--font-serif`, `--font-sans`, `--font-mono`) on the `<html>` element. Tailwind's `font-serif`, `font-sans`, `font-mono` classes will pick these up if we extend Tailwind to look at the variables (Task 7).
- `<html>` gets `data-theme="dark"` set server-side as the default. `suppressHydrationWarning` is added so the client-side Theme provider can override without React complaining.
- Inline `font-serif` class added to the `Page` div so the body inherits Source Serif 4 by default.
- `themeColor` updated from `#1f2937` to `#1A1815` (warm soot).
- `colorScheme` widened to `dark light` (was `dark` only).

- [ ] **Step 2: Confirm fonts load on dev server**

Run: `npm run dev`
Open http://localhost:3000 in a browser. Open devtools → Network → Filter "Font" → confirm Source Serif 4, Geist, and Geist Mono `.woff2` files are loaded. Confirm body text renders in serif.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "swap to Source Serif 4 + Geist + Geist Mono fonts; default html data-theme=dark"
```

---

## Task 7: Tie font CSS variables into Tailwind

**Files:**

- Modify: `tailwind.config.cjs`

- [ ] **Step 1: Update `fontFamily` entries to reference the variables emitted by `next/font`**

In `tailwind.config.cjs`, replace the `fontFamily` block with:

```js
fontFamily: {
  serif: [
    'var(--font-serif)',
    'Iowan Old Style',
    'Source Serif Pro',
    'Georgia',
    'serif',
  ],
  sans: [
    'var(--font-sans)',
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
  ],
  mono: [
    'var(--font-mono)',
    'ui-monospace',
    'SFMono-Regular',
    'monospace',
  ],
},
```

This lets `font-serif`, `font-sans`, `font-mono` resolve to whatever `next/font` provides (with stable system fallbacks).

- [ ] **Step 2: Update the previously-written font test**

Open `src/styles/__tests__/tailwind-tokens.test.tsx` and update the font-family test:

```tsx
it('exposes serif, sans, and mono font families wired to next/font variables', () => {
  const ff = config.theme.extend.fontFamily as Record<string, string[]>
  expect(ff.serif[0]).toBe('var(--font-serif)')
  expect(ff.sans[0]).toBe('var(--font-sans)')
  expect(ff.mono[0]).toBe('var(--font-mono)')
})
```

- [ ] **Step 3: Run the test**

Run: `npm test -- tailwind-tokens`
Expected: All tests pass with the updated assertion.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.cjs src/styles/__tests__/tailwind-tokens.test.tsx
git commit -m "wire next/font CSS variables into Tailwind font families"
```

---

## Task 8: Migrate Theme provider to dark-default + data-theme attribute

**Files:**

- Modify: `src/components/Theme/context.tsx`

- [ ] **Step 1: Read the existing test file to understand what assertions need updating**

Run: `cat src/components/Theme/__tests__/Theme.test.tsx`
This is for context only — make a note of what's being asserted so the migration doesn't accidentally change observable behaviour beyond what's intended.

- [ ] **Step 2: Replace `src/components/Theme/context.tsx` with the dark-default + data-theme implementation**

```tsx
'use client'

import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

enum THEME {
  dark = 'DARK',
  light = 'LIGHT',
  system = 'SYSTEM',
}

interface ThemeStateContext {
  setTheme: (theme: THEME) => void
  theme: THEME
}

const ThemeContext = createContext<ThemeStateContext>({
  theme: THEME.dark,
  setTheme: () => ({}),
})

const isBrowser = typeof window !== 'undefined'

const applyTheme = (theme: THEME): void => {
  if (!isBrowser) return
  const root = document.documentElement

  let resolved: 'dark' | 'light'
  if (theme === THEME.system) {
    resolved = window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  } else {
    resolved = theme === THEME.light ? 'light' : 'dark'
  }

  root.setAttribute('data-theme', resolved)

  // Tailwind dark: variants still depend on the data-theme attribute via
  // tailwind.config.cjs `darkMode: ['selector', '[data-theme="dark"]']`.
  // Body class kept as a defensive fallback for any third-party CSS that
  // looks for `dark`.
  document.body.classList.toggle('dark', resolved === 'dark')
}

const ThemeProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  // Default is dark — server-rendered html already has data-theme="dark".
  const [theme, _setTheme] = useState<THEME>(THEME.dark)
  const ref = useRef(theme)

  const setTheme = (next: THEME): void => {
    ref.current = next
    _setTheme(next)
  }

  const onSystemChange = useCallback(() => {
    if (ref.current === THEME.system) {
      applyTheme(THEME.system)
    }
  }, [])

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    if (!isBrowser) return
    const stored = window.localStorage.getItem('theme')
    if (stored === THEME.dark || stored === THEME.light || stored === THEME.system) {
      setTheme(stored)
    }
  }, [])

  // Apply the active theme whenever it changes.
  useLayoutEffect(() => {
    applyTheme(theme)
    if (isBrowser) {
      window.localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Listen for OS preference changes when in system mode.
  useEffect(() => {
    if (!isBrowser) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [onSystemChange])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

const useTheme = (): [THEME, (theme: THEME) => void] => {
  const { theme, setTheme } = useContext(ThemeContext)
  return [theme, setTheme]
}

export { useTheme, ThemeProvider, THEME }
```

Key changes:
- Default state is `THEME.dark` (was `THEME.system`).
- `applyTheme` consolidates the resolved-theme logic in one place: sets `data-theme` on `<html>`, toggles `body.dark` class as a fallback.
- The dual `(prefers-color-scheme: light)` and `(prefers-color-scheme: dark)` listeners collapse into a single `(prefers-color-scheme: dark)` listener with a single handler.
- `dark-theme` body class is dropped — replaced by the `data-theme` attribute. Any component that depended on `body.dark-theme` will need to update to `[data-theme="dark"]` selectors. (Phase 2-6 will cover those; for now broken components fall back to defaults.)

- [ ] **Step 3: Update existing Theme tests**

Open `src/components/Theme/__tests__/Theme.test.tsx`. Find any assertion that checks for `body.classList.contains('dark-theme')` or for the old default state of `THEME.system` and update to assert the new behaviour:
- Default theme is `THEME.dark`.
- `data-theme` attribute is set on `document.documentElement` to `'dark'` or `'light'`.
- `body.dark` class is toggled, but `body.dark-theme` is no longer used.

If the file has tests that fail on this migration, fix the assertions in line; if a behaviour the test was previously checking is no longer applicable, remove that test. Do not preserve assertions that contradict the new design.

- [ ] **Step 4: Run tests**

Run: `npm test -- Theme`
Expected: All Theme tests pass with updated assertions. Resolve any failure in line with the new design.

- [ ] **Step 5: Commit**

```bash
git add src/components/Theme/context.tsx src/components/Theme/__tests__/Theme.test.tsx
git commit -m "migrate ThemeProvider to dark-default and data-theme attribute"
```

---

## Task 9: Verify the rest of the suite still passes

- [ ] **Step 1: Run the full unit-test suite**

Run: `npm test`
Expected: All tests pass.

If a test fails because it was asserting against the old token names or `body.dark-theme` class, update the assertion to match the new system. If a test fails for an unrelated reason, that is a pre-existing issue and out of scope for this phase — note it but do not fix it here.

- [ ] **Step 2: Lint and typecheck**

Run: `npm run lint`
Expected: No errors. Warnings (e.g. existing `no-img-element` warning in `src/test/next-image.tsx`) are pre-existing and can stay.

- [ ] **Step 3: Build the project**

Run: `npm run build`
Expected: Build completes without errors. Static pages render. Note: legacy components that referenced retired CSS custom properties (e.g. `--background-color`) will render with browser defaults — that visual regression is intentional and gets fixed in Phase 2-6.

- [ ] **Step 4: Commit any pickup fixes from steps 1-2 (if any)**

If steps 1 or 2 required follow-on edits:

```bash
git add -A
git commit -m "fix tests and lint after Field Journal foundation migration"
```

---

## Task 10: Manual visual verification

This phase deliberately leaves components visually unfinished — that work happens in Phase 2-6. The goal of the visual check at the end of Phase 1 is to confirm the *foundation* is sound, not that the site looks done.

- [ ] **Step 1: Run dev server**

Run: `npm run dev`
Open http://localhost:3000 in a browser.

- [ ] **Step 2: Walk the visual checklist**

Confirm each of the following. Mark any failures and address before merging:

- [ ] Page background is warm soot (`#1A1815`), not white or cool slate. (Verify in devtools: `body { background-color: rgb(26, 24, 21) }`.)
- [ ] Body text is warm paper (`#F4EFE6`).
- [ ] `<html>` has `data-theme="dark"` attribute.
- [ ] Body text renders in **Source Serif 4** (inspect a paragraph, check computed font-family).
- [ ] No console errors. (One Sentry-related warning in dev is acceptable if it was there before.)
- [ ] Toggle theme via the Theme button — `<html>` switches to `data-theme="light"`, page background becomes cream (`#F4EDD9`), text becomes ink. Toggling back returns to dark.
- [ ] Reload the page after switching to light — light persists (localStorage).
- [ ] Navigate to an article (e.g. `/articles/13-lambda-recursion`). Body still renders in serif. Components inside (jumbotron image, code blocks, etc.) look broken — that is expected.

- [ ] **Step 3: Stop the dev server.**

- [ ] **Step 4: If any checklist item failed, revert to the last green commit and re-investigate.** No commit needed if all pass.

---

## Phase 1 wrap-up

After Task 10 passes, Phase 1 is complete:
- Tokens defined and exposed via Tailwind.
- Fonts swapped — body now Source Serif 4.
- Theme provider migrated to dark-default with `data-theme` attribute.
- Test coverage on the token bridge and theme switching.

The site looks intentionally broken in places — components have not yet been restyled. Phase 2 (Figure system + content embeds) is the next plan to write.

**Suggested PR commit message for the squashed branch:**

```
Field Journal · Phase 1: foundation

- New design tokens (Field Journal palette: warm soot dark / cream paper light, clay accent, signal yellow, brown-grey neutrals)
- Source Serif 4 body, Geist Sans UI, Geist Mono accents (Lato removed)
- Dark-by-default theme via data-theme attribute on <html>
- Tailwind config wired to expose tokens and font variables
- Tests for token resolution, theme switching, Tailwind bridge

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §6, §7, §14
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-1-foundation.md

Phases 2-6 will restyle individual components against this foundation.
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 1 covers spec §6 (colour system), §7 (typography), §14 (light/dark mode), and lays the foundation for §8 (layout — width tokens). It does *not* cover §9 (page architecture), §10 (article opening), §11 (figure frame), §12 (component inventory), §13 (reading scaffolding), §15 (motion — only tokens, not implementation), §16 (a11y verification — partial, full check happens at end of Phase 7). Those are deferred to subsequent plans, which is intentional and called out at the top of the document.

**Placeholder scan** — No `TBD` / `TODO` / "fill in" markers. Every step has the actual code or command. The "if a test fails" guidance in Task 9 is concrete (update the assertion or remove the test) and not a placeholder.

**Type consistency** — Token names (`--color-bg`, `--color-accent`, etc.) are identical across `tokens.css`, `tailwind.config.cjs`, and the test files. Theme attribute name (`data-theme`) is consistent. `THEME` enum values stay the same as the existing code. `applyTheme` is a new helper, named consistently throughout the new context file.

**Scope check** — Phase 1 produces a working (if partly broken-looking) site with the new foundation. Each task is 2-15 minutes and can be reviewed in isolation. Subsequent phases get their own plans.
