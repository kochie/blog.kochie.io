# Field Journal · Phase 2: Figure System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the unified figure frame that holds every embed type (image · code · video · tweet · linkedin · spotify · github · equation · canvas · quote) as siblings, with auto-numbered captions, three width tiers, and consistent frame styling. After this phase, MDX embeds in existing articles render with the Field Journal frame; new articles can also use `<Figure kind="..." caption="...">` directly.

**Architecture:**
- A single `Figure` component (in `src/components/Figure/`) owns frame + tier + caption + numbering.
- A `FigureProvider` context lives inside `Article` and resets counters per article (FIG.01..FIG.N for figures, EQ.01..EQ.N for equations — separate counters).
- Existing embed components (Quote, Tweet wrapper, LinkedInEmbed, Video, GithubProject, IMG, Equation, Canvas) opt into Figure either internally (own source) or via the MDX components map (third-party).
- Code blocks have their own frame style (filename header, language label, palette swap) but do **not** auto-number — code is its own visual category. Captions on code are opt-in via a wrapping `<Figure kind="code">`.
- KaTeX block math gets a separate `<Equation>` MDX component that wraps Figure with the EQ counter.

**Tech Stack:** React 19 · Next.js 16 App Router · MDX 3 · `react-tweet` · `prism-react-renderer` · `rehype-katex` · Vitest 4 + RTL · Tailwind 4 (tokens + utilities from Phase 1).

**Reference:** Spec §11 (the unified figure frame) at `docs/superpowers/specs/2026-04-30-blog-redesign-design.md`.

**Branch:** continuing on `field-journal/phase-1-foundation` (the user is holding this branch open until the full redesign is ready to merge — see Phase 1 wrap-up). Future phases stack on top.

---

## File Structure

**New files:**
- `src/components/Figure/index.tsx` — the Figure component (frame, tier, caption render).
- `src/components/Figure/context.tsx` — `FigureProvider`, `useFigureNumber`, `useEquationNumber`.
- `src/components/Figure/__tests__/Figure.test.tsx` — component + numbering tests.
- `src/components/Equation/index.tsx` — KaTeX block wrapper using Figure with EQ counter.
- `src/components/Equation/__tests__/Equation.test.tsx` — counter test.

**Modified files:**
- `src/components/Quote/index.tsx` — restyle (signal-yellow stripe, italic 24px serif).
- `src/components/CodeBlocks/codeblock.tsx` — palette swap (clay keywords, signal strings, signal filename), bg-deep surface, mono language label.
- `src/components/CodeBlocks/codeblock.module.css` — switch token references from retired ink/steel to new Field Journal tokens.
- `src/components/GithubProject/index.tsx` — accent-bordered card, restyle.
- `src/components/MDXWrapper/components.tsx` — register `Figure`, `Equation`; replace `IMG` body with Figure frame; wrap `Tweet` and `Video` in Figure auto-frames.
- `src/components/MDXWrapper/client_components.tsx` — wrap `LinkedInEmbed` in Figure auto-frame.
- `src/components/Article/index.tsx` — wrap children in `<FigureProvider>` so counters scope per-article.

**Files explicitly NOT changed in Phase 2:**
- The Article page layout and reading scaffolding — those live in Phase 3.
- The Homepage (Jumbotron / HeroFeature / RecentRow / ArchiveList) — Phase 4.
- Topbar / Footer / Tag / Theme button chrome — Phase 6.
- The MDX content files themselves (no edits to `articles/*/index.mdx`).

---

## Task 1: Build the FigureProvider context

**Files:**
- Create: `src/components/Figure/context.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/Figure/__tests__/Figure.context.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FigureProvider, useFigureNumber, useEquationNumber } from '../context'

const FigureProbe = () => <span data-testid="fig">{useFigureNumber()}</span>
const EqProbe = () => <span data-testid="eq">{useEquationNumber()}</span>

describe('FigureProvider', () => {
  it('numbers figures sequentially within a single provider', () => {
    const { getAllByTestId } = render(
      <FigureProvider>
        <FigureProbe />
        <FigureProbe />
        <FigureProbe />
      </FigureProvider>
    )
    expect(getAllByTestId('fig').map((n) => n.textContent)).toEqual(['1', '2', '3'])
  })

  it('numbers equations on a separate counter from figures', () => {
    const { getAllByTestId } = render(
      <FigureProvider>
        <FigureProbe />
        <EqProbe />
        <FigureProbe />
        <EqProbe />
      </FigureProvider>
    )
    expect(getAllByTestId('fig').map((n) => n.textContent)).toEqual(['1', '2'])
    expect(getAllByTestId('eq').map((n) => n.textContent)).toEqual(['1', '2'])
  })

  it('returns 0 outside a FigureProvider so usage is detectable', () => {
    const { getByTestId } = render(<FigureProbe />)
    expect(getByTestId('fig').textContent).toBe('0')
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npm test -- Figure.context`
Expected: FAIL — module `'../context'` not found.

- [ ] **Step 3: Implement the FigureProvider context**

Create `src/components/Figure/context.tsx`:

```tsx
'use client'

import React, {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
  type ReactElement,
} from 'react'

interface FigureCounters {
  nextFigure: () => number
  nextEquation: () => number
}

const FigureContext = createContext<FigureCounters | null>(null)

/**
 * Scopes figure and equation numbering. Wrap an article in this so each
 * article restarts at FIG.01 / EQ.01. Mounting two providers (e.g. a
 * preview + main) gives them independent counters by design.
 */
const FigureProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  const figRef = useRef(0)
  const eqRef = useRef(0)
  const value: FigureCounters = {
    nextFigure: () => ++figRef.current,
    nextEquation: () => ++eqRef.current,
  }
  return <FigureContext.Provider value={value}>{children}</FigureContext.Provider>
}

/**
 * Returns the next figure number on first render. The number is captured
 * in a ref so re-renders of the same instance keep their assigned number.
 * Outside a FigureProvider this returns 0 — meant to surface misuse rather
 * than crash, since MDX may render embeds in unexpected contexts.
 */
const useFigureNumber = (): number => {
  const ctx = useContext(FigureContext)
  const numRef = useRef<number | null>(null)
  if (numRef.current === null) {
    numRef.current = ctx ? ctx.nextFigure() : 0
  }
  return numRef.current
}

const useEquationNumber = (): number => {
  const ctx = useContext(FigureContext)
  const numRef = useRef<number | null>(null)
  if (numRef.current === null) {
    numRef.current = ctx ? ctx.nextEquation() : 0
  }
  return numRef.current
}

export { FigureProvider, useFigureNumber, useEquationNumber }
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npm test -- Figure.context`
Expected: 3/3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Figure/context.tsx src/components/Figure/__tests__/Figure.context.test.tsx
git commit -m "add FigureProvider context with figure and equation counters"
```

---

## Task 2: Build the Figure component

**Files:**
- Create: `src/components/Figure/index.tsx`
- Create test: `src/components/Figure/__tests__/Figure.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/Figure/__tests__/Figure.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FigureProvider } from '../context'
import { Figure } from '../index'

describe('Figure', () => {
  it('renders children inside the frame', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="A cat">
          <img alt="cat" src="/cat.png" />
        </Figure>
      </FigureProvider>
    )
    expect(getByText('A cat')).toBeTruthy()
  })

  it('numbers figures sequentially with the FIG prefix', () => {
    const { getAllByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="first">
          <span>a</span>
        </Figure>
        <Figure kind="image" caption="second">
          <span>b</span>
        </Figure>
      </FigureProvider>
    )
    expect(getAllByText(/FIG\. 0[12]/).map((el) => el.textContent)).toEqual([
      'FIG. 01',
      'FIG. 02',
    ])
  })

  it('uses the EQ prefix when kind="equation"', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="equation" caption="Pythagoras">
          <span>a²+b²=c²</span>
        </Figure>
      </FigureProvider>
    )
    expect(getByText('EQ. 01')).toBeTruthy()
  })

  it('omits the number prefix when no caption is provided', () => {
    const { container } = render(
      <FigureProvider>
        <Figure kind="image">
          <span>silent</span>
        </Figure>
      </FigureProvider>
    )
    expect(container.textContent).not.toMatch(/FIG\./)
  })

  it('applies the wide tier max-width class', () => {
    const { container } = render(
      <FigureProvider>
        <Figure kind="code" tier="wide" caption="wide one">
          <pre>code</pre>
        </Figure>
      </FigureProvider>
    )
    const root = container.querySelector('figure')
    expect(root?.className).toMatch(/max-w-wide/)
  })

  it('renders an optional source line in mono', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="Cap" source="Photographer, 2026">
          <img alt="x" src="/x.png" />
        </Figure>
      </FigureProvider>
    )
    expect(getByText(/Photographer, 2026/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- Figure.test`
Expected: FAIL — module `'../index'` not found.

- [ ] **Step 3: Implement Figure**

Create `src/components/Figure/index.tsx`:

```tsx
import React, { type PropsWithChildren, type ReactElement } from 'react'
import clsx from 'clsx'
import { useFigureNumber, useEquationNumber } from './context'

type FigureKind =
  | 'image'
  | 'code'
  | 'video'
  | 'tweet'
  | 'linkedin'
  | 'spotify'
  | 'github'
  | 'equation'
  | 'canvas'
  | 'quote'

type FigureTier = 'prose' | 'wide' | 'bleed'

export interface FigureProps {
  kind: FigureKind
  tier?: FigureTier
  caption?: string
  source?: string
  className?: string
}

const tierClass: Record<FigureTier, string> = {
  prose: 'max-w-prose',
  wide: 'max-w-wide',
  bleed: 'max-w-bleed',
}

const FigureCaption = ({
  kind,
  caption,
  source,
}: Pick<FigureProps, 'kind' | 'caption' | 'source'>) => {
  // Numbers must be requested unconditionally to keep hook order stable.
  const figureN = useFigureNumber()
  const equationN = useEquationNumber()
  if (!caption && !source) return null
  const isEquation = kind === 'equation'
  const n = isEquation ? equationN : figureN
  const prefix = isEquation ? 'EQ.' : 'FIG.'
  const padded = String(n).padStart(2, '0')
  return (
    <figcaption className="mt-3 font-mono text-meta text-text-soft tracking-wide">
      {caption ? (
        <span>
          <span className="text-accent mr-2">
            {prefix} {padded}
          </span>
          {caption}
        </span>
      ) : null}
      {source ? (
        <span className="block mt-1 text-text-soft/80">{source}</span>
      ) : null}
    </figcaption>
  )
}

export const Figure = ({
  kind,
  tier = kind === 'image' || kind === 'quote' ? 'prose' : 'wide',
  caption,
  source,
  className,
  children,
}: PropsWithChildren<FigureProps>): ReactElement => {
  return (
    <figure
      className={clsx(
        'mx-auto my-10',
        tierClass[tier],
        className
      )}
      data-figure-kind={kind}
    >
      <div className="border border-rule rounded-md overflow-hidden bg-bg-soft">
        {children}
      </div>
      <FigureCaption kind={kind} caption={caption} source={source} />
    </figure>
  )
}

export default Figure
```

Notes for implementer:
- `clsx` is already in `package.json` dependencies — no new install needed.
- The default tier per `kind` follows spec §11: image/quote default to prose; everything else (code/video/tweet/linkedin/spotify/github/equation/canvas) defaults to wide. Authors can pass `tier="bleed"` for hero figures.
- The frame uses `bg-bg-soft` for a subtle elevation tint; embeds that need a different surface (e.g. code blocks at `bg-bg-deep`) override via the inner content's own class.
- `data-figure-kind` is exposed for downstream styling hooks.

- [ ] **Step 4: Run the tests to confirm pass**

Run: `npm test -- Figure.test`
Expected: 6/6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Figure/index.tsx src/components/Figure/__tests__/Figure.test.tsx
git commit -m "add Figure component with tier sizing and auto-numbered captions"
```

---

## Task 3: Wire FigureProvider into Article

**Files:**
- Modify: `src/components/Article/index.tsx`

- [ ] **Step 1: Wrap the MDX children in FigureProvider**

Open `src/components/Article/index.tsx`. Find where the article body is rendered (the inner `<Card>` block that wraps `{children}`) and wrap `{children}` in `<FigureProvider>...</FigureProvider>`. Add the import at the top:

```tsx
import { FigureProvider } from '@/components/Figure/context'
```

The relevant change inside the existing JSX is replacing `{children}` with `<FigureProvider>{children}</FigureProvider>`. Keep all other Article content unchanged — the layout itself doesn't ship in this phase (Phase 3's job).

- [ ] **Step 2: Run existing Article tests**

Run: `npm test -- Article`
Expected: pass. The wrapper is transparent for tests that don't use Figure.

- [ ] **Step 3: Commit**

```bash
git add src/components/Article/index.tsx
git commit -m "wrap article body in FigureProvider so counters scope per-article"
```

---

## Task 4: Register Figure in the MDX components map

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Add the Figure import and the map entry**

At the top of `src/components/MDXWrapper/components.tsx`, add:

```tsx
import Figure from '@/components/Figure'
```

In the exported `components` object, add an entry near the bottom:

```tsx
Figure,
```

That's the only change. The Figure component is now usable directly in MDX articles as `<Figure kind="..." caption="...">...</Figure>`.

- [ ] **Step 2: Run the MDX components test**

Run: `npm test -- MDXWrapper`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/MDXWrapper/components.tsx
git commit -m "register Figure in the MDX components map"
```

---

## Task 5: Restyle the Quote component to spec

**Files:**
- Modify: `src/components/Quote/index.tsx`

- [ ] **Step 1: Replace the Quote body**

Replace the entire contents of `src/components/Quote/index.tsx` with:

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/pro-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React, { type PropsWithChildren } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface QuoteProps {
  author?: string
  position?: string
  twitter?: string
  src?: string
  web?: string
}

/**
 * Pull-quote: serif italic, signal-yellow left stripe, optional attribution
 * line in mono. Spec §11.2 (kind="quote").
 */
export default function Quote({
  author,
  position,
  twitter,
  children,
  src,
  web,
}: PropsWithChildren<QuoteProps>) {
  const hasAttribution = author || position || src
  return (
    <div className="mx-auto max-w-prose my-10">
      <div className="border-l-2 border-signal pl-6 py-2">
        <blockquote className="font-serif italic text-2xl leading-snug text-text">
          {children}
        </blockquote>
        {hasAttribution ? (
          <div className="mt-4 flex items-center gap-3 font-mono text-meta text-text-soft tracking-wide">
            {src ? (
              <Image
                src={src}
                alt={author ? `Photo of ${author}` : ''}
                height={32}
                width={32}
                className="h-8 w-8 rounded-full"
              />
            ) : null}
            <span>
              {author ? <span className="text-text">{author}</span> : null}
              {author && position ? <span> · </span> : null}
              {position ? <span>{position}</span> : null}
            </span>
            {twitter ? (
              <Link href={twitter} aria-label={`${author ?? 'Author'} on Twitter`}>
                <FontAwesomeIcon icon={faTwitter} />
              </Link>
            ) : null}
            {web ? (
              <Link href={web} aria-label={`${author ?? 'Author'} website`}>
                <FontAwesomeIcon icon={faGlobe} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the Quote tests**

Run: `npm test -- Quote`
Expected: pass. If the existing Quote tests assert on the old `faQuoteLeft`/`faQuoteRight`/`faHyphen` icons or the old class names, update them to match the new structure (the Quote contract shape — props — has not changed). If the test snapshots stale, regenerate.

- [ ] **Step 3: Commit**

```bash
git add src/components/Quote/index.tsx src/components/Quote/__tests__/Quote.test.tsx src/components/Quote/__tests__/__snapshots__/Quote.test.tsx.snap
git commit -m "restyle Quote: signal-yellow left stripe, italic 2xl serif"
```

(Stage only the snapshot file if it actually changed; otherwise leave it.)

---

## Task 6: Wrap Tweet in Figure via the MDX components map

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Replace the bare `Tweet` import with a wrapped variant**

In `src/components/MDXWrapper/components.tsx`:

Change the existing `import { Tweet } from 'react-tweet'` line. Below the imports, add a wrapper component:

```tsx
import { Tweet as RawTweet } from 'react-tweet'

interface TweetProps {
  id: string
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

const Tweet = ({ id, caption, tier = 'wide' }: TweetProps) => (
  <Figure kind="tweet" tier={tier} caption={caption}>
    <RawTweet id={id} />
  </Figure>
)
```

Keep the existing `Tweet` entry in the `components` map — it now references the wrapped variant, transparently to article authors.

Existing articles using `<Tweet id="..." />` continue to render and now have the Field Journal frame; authors can opt into a caption with `<Tweet id="..." caption="..." />`.

- [ ] **Step 2: Smoke-test rendering**

Run: `npm run build`
Expected: build completes without errors. Articles using `<Tweet />` still SSG.

- [ ] **Step 3: Commit**

```bash
git add src/components/MDXWrapper/components.tsx
git commit -m "auto-wrap Tweet embed in Figure with optional caption prop"
```

---

## Task 7: Wrap LinkedInEmbed in Figure

**Files:**
- Modify: `src/components/MDXWrapper/client_components.tsx`

- [ ] **Step 1: Update LinkedInEmbed**

Replace the contents of `src/components/MDXWrapper/client_components.tsx` with:

```tsx
'use client'

import { useWindowSize } from '@uidotdev/usehooks'
import Figure from '@/components/Figure'

interface LinkedInEmbedProps {
  url: string
  width?: number
  height?: number
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

export function LinkedInEmbed({
  url,
  width = 504,
  height = 573,
  caption,
  tier = 'wide',
}: LinkedInEmbedProps) {
  const { width: windowWidth } = useWindowSize()
  return (
    <Figure kind="linkedin" tier={tier} caption={caption}>
      <div className="flex justify-center bg-bg-deep p-4">
        <iframe
          src={url}
          width={Math.min((windowWidth ?? Infinity) - 60, width)}
          height={height}
          allowFullScreen
          title="LinkedIn post"
          className="rounded-md border border-rule"
        />
      </div>
    </Figure>
  )
}
```

The `useEffect` import was unused in the prior file (already absent in the snapshot above, which removes it). The hardcoded inline borderRadius/border/boxShadow is replaced by `bg-bg-deep` + `border-rule` + Tailwind utilities.

- [ ] **Step 2: Run build to confirm**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/MDXWrapper/client_components.tsx
git commit -m "wrap LinkedInEmbed in Figure with optional caption"
```

---

## Task 8: Wrap Video in Figure

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Replace VIDEO with a Figure-wrapped variant**

In `src/components/MDXWrapper/components.tsx`, find the existing `VIDEO` constant. Replace it with:

```tsx
interface VideoProps
  extends React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  > {
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

const VIDEO = ({ caption, tier = 'wide', ...props }: VideoProps) => {
  return (
    <Figure kind="video" tier={tier} caption={caption}>
      <video {...props} className="block w-full h-auto" />
    </Figure>
  )
}
```

The existing `style: { display: 'flex', justifyContent: 'center' }` wrapper is replaced by Figure's centring + tier sizing. `className="block w-full h-auto"` replaces the centering trick the inline div was doing.

`props.style` and `props.className` from the MDX site can still be applied — destructure them out if the article author passes a `className` they want to keep:

```tsx
const VIDEO = ({ caption, tier = 'wide', className, ...props }: VideoProps) => (
  <Figure kind="video" tier={tier} caption={caption}>
    <video {...props} className={clsx('block w-full h-auto', className)} />
  </Figure>
)
```

Add `import clsx from 'clsx'` if not already imported in the file.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: pass. Articles using `<Video src="..." autoPlay loop muted />` still render — now inside the Figure frame.

- [ ] **Step 3: Commit**

```bash
git add src/components/MDXWrapper/components.tsx
git commit -m "wrap Video in Figure with optional caption"
```

---

## Task 9: Restyle GithubProject and wrap in Figure

**Files:**
- Read first: `src/components/GithubProject/index.tsx` (skim to understand current structure)
- Modify: `src/components/GithubProject/index.tsx`

- [ ] **Step 1: Restyle the card body to use new tokens**

Current GithubProject renders a card with hardcoded colours (slate / gray / etc.). Replace the outermost wrapper colours with new tokens, and wrap the entire return in `<Figure kind="github" tier="wide" caption={caption}>...</Figure>`.

Add the following to the `GithubProjectProps` interface:

```ts
caption?: string
tier?: 'prose' | 'wide' | 'bleed'
```

In the return statement, replace the outermost div (currently the card root) with:

```tsx
<Figure kind="github" tier={tier ?? 'wide'} caption={caption}>
  <div className="bg-bg-deep border-l-2 border-accent p-5">
    {/* …existing card body markup, with these substitutions: */}
  </div>
</Figure>
```

Inside the card body, do these substitutions throughout the existing JSX:
- `bg-slate-*` → `bg-bg-deep`
- `text-slate-*` (light shades) → `text-text-mute`
- `text-slate-*` (very light) → `text-text-soft`
- `text-white` (in card body) → `text-text`
- Any link colour → `text-accent hover:text-accent/80`
- Border colours → `border-rule`

The repo card retains its existing structure (avatar/name/description/star count); only the colours shift.

If the file is long or has nested helpers, ask before splitting — keep all changes inside the file.

- [ ] **Step 2: Run GithubProject tests**

Run: `npm test -- GithubProject`
Expected: pass. If snapshot tests fail because the output changed, regenerate them.

- [ ] **Step 3: Commit**

```bash
git add src/components/GithubProject/index.tsx \
  src/components/GithubProject/__tests__/__snapshots__/GithubProject.test.tsx.snap
git commit -m "restyle GithubProject to Field Journal palette and wrap in Figure"
```

(Stage the snapshot file only if it actually changed.)

---

## Task 10: Build the Equation component

**Files:**
- Create: `src/components/Equation/index.tsx`
- Create: `src/components/Equation/__tests__/Equation.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/Equation/__tests__/Equation.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FigureProvider } from '@/components/Figure/context'
import Equation from '../index'

describe('Equation', () => {
  it('renders KaTeX block content with EQ counter when captioned', () => {
    const { getByText } = render(
      <FigureProvider>
        <Equation caption="Pythagoras">a² + b² = c²</Equation>
      </FigureProvider>
    )
    expect(getByText('EQ. 01')).toBeTruthy()
    expect(getByText(/Pythagoras/)).toBeTruthy()
  })

  it('omits the EQ prefix when no caption is given', () => {
    const { container } = render(
      <FigureProvider>
        <Equation>x² = 1</Equation>
      </FigureProvider>
    )
    expect(container.textContent).not.toMatch(/EQ\./)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- Equation`
Expected: FAIL — module `'../index'` not found.

- [ ] **Step 3: Implement Equation**

Create `src/components/Equation/index.tsx`:

```tsx
import React, { type PropsWithChildren, type ReactElement } from 'react'
import Figure from '@/components/Figure'

export interface EquationProps {
  caption?: string
  source?: string
  /**
   * `wide` is the default. `bleed` for very large derivations.
   */
  tier?: 'wide' | 'bleed'
}

/**
 * Wraps a KaTeX-rendered block expression in the Figure frame, using the
 * separate equation counter (EQ.01..EQ.N).
 *
 * MDX usage:
 *   <Equation caption="Centripetal force">
 *     {`F = \\frac{m v^2}{r}`}
 *   </Equation>
 *
 * For inline math, keep the standard `$...$` rehype-katex pipeline; this
 * component is for block math you want numbered.
 */
const Equation = ({
  caption,
  source,
  tier = 'wide',
  children,
}: PropsWithChildren<EquationProps>): ReactElement => {
  return (
    <Figure kind="equation" tier={tier} caption={caption} source={source}>
      <div className="bg-bg-deep py-6 px-8 text-text font-serif text-lg overflow-x-auto">
        {children}
      </div>
    </Figure>
  )
}

export default Equation
```

Note: the children passed to `<Equation>` in MDX are typically a string of LaTeX. Rehype-katex transforms the surrounding `$$...$$` blocks into rendered HTML; for `<Equation>{...}</Equation>`, an article author can either pass pre-rendered MathML (rare) or use a child rehype pass. For Phase 2 the component renders children as-is; Phase 3 may add a KaTeX render call here if needed.

- [ ] **Step 4: Register Equation in MDX components map**

In `src/components/MDXWrapper/components.tsx`, add:

```tsx
import Equation from '@/components/Equation'
```

And add `Equation,` to the `components` export object alongside `Figure`.

- [ ] **Step 5: Run tests**

Run: `npm test -- Equation`
Expected: 2/2 pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Equation/index.tsx \
  src/components/Equation/__tests__/Equation.test.tsx \
  src/components/MDXWrapper/components.tsx
git commit -m "add Equation component using Figure with EQ counter"
```

---

## Task 11: Restyle CodeBlocks to the Field Journal palette

**Files:**
- Modify: `src/components/CodeBlocks/codeblock.tsx`
- Modify: `src/components/CodeBlocks/codeblock.module.css`

- [ ] **Step 1: Read current state**

Open `src/components/CodeBlocks/codeblock.tsx` and `codeblock.module.css` to understand the existing wrapping (it uses `prism-react-renderer` and the existing module CSS for layout).

- [ ] **Step 2: Update the surface, header, and palette**

In `codeblock.tsx`, replace the prism theme selection with a custom Field Journal theme. Find the current `themes.<something>` usage and replace it with:

```tsx
const fieldJournalTheme = {
  plain: {
    color: 'var(--color-text-mute)',
    backgroundColor: 'var(--color-bg-deep)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--color-text-soft)', fontStyle: 'italic' },
    },
    {
      types: ['keyword', 'tag', 'selector', 'attr-name', 'operator'],
      style: { color: 'var(--color-accent)' },
    },
    {
      types: ['string', 'char', 'inserted', 'attr-value'],
      style: { color: 'var(--color-signal)' },
    },
    {
      types: ['function', 'class-name', 'property'],
      style: { color: 'var(--color-text)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: 'var(--color-accent)' },
    },
    {
      types: ['punctuation'],
      style: { color: 'var(--color-text-soft)' },
    },
  ],
}
```

Use this theme in the `Highlight` component:

```tsx
<Highlight prism={Prism} code={code} language={lang} theme={fieldJournalTheme as never}>
  {/* …existing render-prop body… */}
</Highlight>
```

In the same file, find the `filename` rendering. Replace whatever colour class it currently has with `text-signal font-mono text-meta`. Find the language label and apply `text-text-soft font-mono text-meta`.

In `codeblock.module.css`, find any `--*-color` references and update them to the new tokens (`var(--color-bg-deep)`, `var(--color-text)`, etc.). If the module relies on retired tokens, replace them with `bg-bg-deep`, `text-text`, etc. — apply the same substitution rules used in Task 9.

- [ ] **Step 3: Run CodeBlocks tests**

Run: `npm test -- CodeBlocks`
Expected: pass. If snapshot tests fail because the CSS classes changed, regenerate.

- [ ] **Step 4: Smoke-test by building**

Run: `npm run build`
Expected: pass. Articles with code blocks SSG correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/CodeBlocks/codeblock.tsx \
  src/components/CodeBlocks/codeblock.module.css \
  src/components/CodeBlocks/__tests__/__snapshots__/CodeBlocks.test.tsx.snap
git commit -m "restyle CodeBlocks to Field Journal palette: clay keywords, signal strings"
```

(Stage the snapshot file only if it actually changed.)

---

## Task 12: Restyle the markdown image and blockquote MDX wrappers

**Files:**
- Modify: `src/components/MDXWrapper/components.tsx`

- [ ] **Step 1: Replace `IMG` to render through Figure**

Find the `IMG` constant (the markdown `![alt](src)` MDX wrapper). Replace its body with:

```tsx
const IMG = ({
  src,
  alt,
  lqip,
}: {
  src?: string
  alt?: string
  lqip?: string
  articleDir?: string
}): ReactElement => {
  const params = new URLSearchParams(src?.split('?')[1])
  const filename = src?.split('?')[0] ?? ''

  const imageNode = filename.endsWith('.svg') ? (
    <picture>
      <source srcSet={src} type="image/svg+xml" />
      <img
        src={src}
        alt={alt}
        width={parseInt(params.get('width') ?? '0')}
        height={parseInt(params.get('height') ?? '0')}
      />
    </picture>
  ) : (
    <Image
      src={src ?? ''}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        height: 'auto',
        // @ts-expect-error - objectFit is not a valid React.Image style key
        objectFit: params.get('objectFit') ?? undefined,
      }}
      placeholder="blur"
      blurDataURL={lqip}
      height={parseInt(params.get('height') ?? '0')}
      width={parseInt(params.get('width') ?? '0')}
      unoptimized={params.has('unoptimized')}
      alt={alt ?? ''}
    />
  )

  return (
    <Figure kind="image" tier="wide" caption={alt}>
      <div className="bg-bg-deep">{imageNode}</div>
    </Figure>
  )
}
```

The `?width=X&height=Y&unoptimized&objectFit=...` query convention is preserved. The hardcoded grey caption box (`bg-gray-700 text-white`) is replaced — caption now flows through Figure's `caption` prop (which uses the `alt` text by default).

- [ ] **Step 2: Replace `BLOCKQUOTE` to use the Quote-style stripe for inline blockquotes too**

Find the `BLOCKQUOTE` constant. Replace it with:

```tsx
const BLOCKQUOTE = ({ children }: PropsOnlyChildren) => (
  <div className="mx-auto max-w-prose my-8">
    <blockquote className="border-l-2 border-accent pl-6 py-2 font-serif italic text-xl leading-snug text-text-mute">
      {children}
    </blockquote>
  </div>
)
```

This is the markdown `>` blockquote style — distinct from the explicit `<Quote>` component (which uses signal yellow + attribution). Markdown blockquotes get a clay accent stripe and italic serif, slightly smaller than `<Quote>`.

- [ ] **Step 3: Run MDXWrapper tests**

Run: `npm test -- MDXWrapper`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/MDXWrapper/components.tsx
git commit -m "restyle markdown image and blockquote wrappers to Field Journal frame"
```

---

## Task 13: Smoke-test rendering on existing articles

**Files:**
- No changes — verification only.

- [ ] **Step 1: Build the project**

Run: `npm run build`
Expected: build completes without errors. All static pages generate.

- [ ] **Step 2: Run the dev server and visit a code-heavy article and a math-heavy article**

Run: `npm run dev`

Open in browser:
- http://localhost:3000/articles/13-lambda-recursion (code blocks, Tweet, LinkedInEmbed, Video, Quote)
- http://localhost:3000/articles/01-halo-physics (KaTeX block math, images, Spotify iframe)
- http://localhost:3000/articles/02-contact-tracing (GithubProject, code blocks, images, TOC)

Confirm no console errors related to Figure / FigureProvider / undefined components.

Visual checks (no formal assertion; eyeball):
- Code blocks render with the warm bg-deep surface, signal filename, accent keywords
- Tweet, LinkedInEmbed, Video render inside framed containers
- Quote renders with signal-yellow stripe
- Markdown blockquotes render with clay stripe
- GithubProject renders with accent-bordered card

If anything fails to render, open the console, capture the error, and report it. Do not silently fix — capture in the report so the next phase can address.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 4: Stop the dev server.**

- [ ] **Step 5: Commit only if anything was nudged in this verification step (likely nothing).** Otherwise skip — Phase 2 is complete.

---

## Phase 2 wrap-up

After Task 13 passes, Phase 2 is complete:
- Figure component owns the unified frame.
- FigureProvider scopes counters per article.
- Tweet, LinkedInEmbed, Video, GithubProject embed types auto-render inside Figure.
- Equation component handles block math with EQ counter.
- Quote restyled to spec.
- CodeBlocks repalette'd to Field Journal.
- Markdown image and blockquote MDX wrappers updated.

Existing articles still render. New articles can use `<Figure kind="..." caption="..." source="...">` for any custom embed.

**Suggested squashed PR commit message** (when the redesign branch eventually lands):

```
Field Journal · Phase 2: figure system + content embeds

- New Figure component with three width tiers and per-article auto-numbered captions
- FigureProvider context scopes FIG.NN and EQ.NN counters per article
- All embed types (Tweet, LinkedInEmbed, Video, GithubProject, IMG, Quote, Equation) render inside the unified frame
- CodeBlocks repalette'd to clay keywords / signal strings / bg-deep surface
- Markdown blockquote and image MDX wrappers restyled

Spec: docs/superpowers/specs/2026-04-30-blog-redesign-design.md §11
Plan: docs/superpowers/plans/2026-04-30-blog-field-journal-phase-2-figure-system.md
```

---

## Self-review (executed by author)

**Spec coverage** — Phase 2 covers spec §11 (the unified figure frame) and the per-embed treatments of Quote, Tweet, LinkedIn, Video, GithubProject, image, equation, and code block. It does NOT cover Spotify and Canvas wrappers — those are deferred to Phase 2.5 (small follow-up) so this plan stays bounded. The deferred items are tracked at the bottom of this section.

**Placeholder scan** — No `TBD` / `TODO` / "fill in" markers. Tasks 5 and 9 reference snapshot files and instruct the implementer to stage them only if they actually changed — that's concrete guidance, not a placeholder. Task 13 is a verification-only step with explicit visual checks; if it surfaces a bug, the implementer captures it in the report rather than silently fixing.

**Type consistency** — `FigureKind` includes `'tweet'`, `'linkedin'`, `'spotify'`, `'github'`, etc. Each consumer (Task 6 Tweet, Task 7 LinkedIn, Task 8 Video, Task 9 GithubProject, Task 10 Equation, Task 12 IMG) uses the matching kind. `FigureTier` (`'prose' | 'wide' | 'bleed'`) is consistent across all wrappers and the Figure default-tier logic.

**Scope check** — 13 tasks. Each is 5–20 minutes for a focused implementer. No task spans more than two files. The total Phase 2 work is bounded — if the dev server smoke test fails, the implementer surfaces the error rather than expanding scope.

**Deferred to Phase 2.5 (small follow-up plan, written after Phase 2 lands):**
- Spotify iframe wrapper — currently rendered via the `Iframe` MDX wrapper, which is generic. A dedicated `<SpotifyEmbed>` would benefit from the Figure frame and a caption.
- Canvas wrapper — `Canvasses` (currently just `RingSpinner`) needs an MDX-friendly outer that adds the `// interactive` mono marker top-left and uses Figure with `kind="canvas"`. Easy to add when there's a second canvas to compose.

These two items are NOT blockers for Phase 3 (article layout + reading scaffolding). They can land in parallel.
