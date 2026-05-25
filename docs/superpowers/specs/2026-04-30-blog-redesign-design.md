# blog.kochie.io — Field Journal redesign

*Design spec. 2026-04-30. Companion to `docs/01-brand-foundation.md` and `docs/02-visual-identity.md`. Supersedes the blog-specific recommendations in `docs/03-per-site-positioning.md` and the "terminal green / coding-forward" direction in `docs/02-visual-identity.md` §2.*

---

## 1. Summary

A dark-first, serif-bodied editorial space for long-form engineering essays. Built around a unified figure frame that holds prose, math, code, video, tweets, LinkedIn embeds, Spotify, GitHub project cards, and interactive canvases as equal citizens. The homepage replaces the current PCB-jumbotron with a Spectrum-style hero feature, a recent-essays card row, and a numbered archive. Palette is warm-Melbourne, not SF-glossy: warm soot dark, cream paper light, clay accent, buttery signal yellow, brown-grey neutrals.

The codename is **Field Journal**.

## 2. Goals

- Optimise for 10-minute reads. Reading comfort over editorial flash.
- A single figure frame that holds 12+ embed types as siblings.
- A distinctive identity: warm Melbourne, not SF gloss; not terminal cosplay; not a docs site.
- First-class light *and* dark mode, designed simultaneously, same warmth across both.
- Coherent with the Kochie Engineering brand foundation: master tokens preserved, voice unchanged, type stack extended.
- Surface the engineering-rigor side via a numbered archive (homepage section + standalone `/archive`).
- Provide a curatorial mechanism (a `featured: true` frontmatter flag) so the hero feature can be steered, with sensible defaults.

## 3. Non-goals

- Redesigning kochie.io, me.kochie.io, or product sites. They get a *separate* sub-brand pass later.
- Replacing `KochieEngineeringLogo.svg`. The mark stays.
- Migrating MDX content. Existing articles must continue to render with no edits.
- Adding search, full-text or otherwise. Tracked separately.
- A new author-system. Rob is the only author; multi-author can come later if needed.

## 4. Audience and content fit

The 13 existing articles dictate the design problem more than the brand docs do. A summary of what the frame must hold:

- **Math-heavy essays** (Halo physics, S3 file limits, HPC with Step Functions) with KaTeX block + inline equations.
- **Architecture / AWS internals** (Contact tracing, Lambda recursion, HPC) with code blocks, GitHub project cards, architecture diagrams.
- **Tutorials** (Holopin, Revue, Next.js 13, Electron IAP) — step-driven prose with code blocks.
- **Opinion / thought-leadership** (Lambda recursion, Up banking review, City flag redesign) — first-person essays, often with embedded tweets, LinkedIn posts, Spotify clips, mp4 video.
- **Voice**: first-person, conversational, occasionally grumpy, "I know. I know. I know."

Audience: working engineers (primary), engineering-curious decision-makers (secondary), the long-tail Google reader who arrived for one specific answer (tertiary).

## 5. Design principles

These govern every decision below. When tokens conflict, the principle wins.

1. **Type does the work.** Strong typographic system, minimal ornament. The serif body is the brand.
2. **The figure frame holds everything.** Code, video, tweet, math, canvas — same numbered, mono-captioned frame. Sibling content reads as siblings.
3. **Warm Melbourne, not SF gloss.** Every neutral is brown-grey, every accent biased warm.
4. **Hook first, hero second.** Article opening rewards a strong first sentence over a giant image.
5. **Dark-first, light first-class.** Both modes designed simultaneously. Same warmth across both.

## 6. Colour system

Master brand tokens are preserved (`ink`, `paper`, `signal`, `wire`, `steel`, `coral`, `terminal`, `key`). The blog uses a refined, warm-leaning subset and overrides defaults where the unmodified master tokens read too cool.

### 6.1. Token table

| Token | Light hex | Dark hex | Role |
|---|---|---|---|
| `bg` | `#F4EDD9` (cream paper) | `#1A1815` (warm soot) | Page background |
| `bg-deep` | `#ECE2C6` | `#14110E` | Code block surface, raised cards |
| `bg-soft` | `#FAF6E8` | `#232019` | Subtle elevations, callouts, sidenotes |
| `text` | `#1A1815` | `#F4EFE6` | Primary text |
| `text-mute` | `#4D4538` | `#C9C0B0` | Decks, secondary text |
| `text-soft` | `#847A6B` | `#8C8576` | Captions, mono meta, tertiary |
| `accent` (clay) | `#C46A4A` | `#DA8665` | Links, diagram strokes, hover, active TOC, kicker numbers, CTA borders |
| `signal` | `#DBC23A` | `#F2DC4A` | Spotlights only — pinned essay marker, code strings, "the one thing that matters here" |
| `rule` | `rgba(26,24,21,0.12)` | `rgba(244,239,230,0.08)` | Hairlines, dividers, frame borders |
| `steel-warm-700` | `#58504A` | `#58504A` | Mid-grey neutrals (re-tuned from cool steel-700) |
| `steel-warm-500` | `#8C8576` | `#8C8576` | Mid-tones |
| `steel-warm-300` | `#C9C0B0` | `#C9C0B0` | Light borders, inactive states |

### 6.2. Tokens kept but unused on the blog

These are part of the master family but **must not appear** on blog.kochie.io chrome:

- `coral` `#F26D5B` — reserved for me.kochie.io.
- `key` `#0E7C7B` — reserved for touch-typer.kochie.io.
- `wire` `#1F4FFF` — replaced on blog by `accent` (clay).
- `terminal` `#00D17A` — explicitly retired from the blog.

(They may still appear *inside* article content where the author chooses, e.g. inside an embedded image or syntax theme, but never in chrome.)

### 6.3. Accessibility

- `text` on `bg` and `text` on `bg-deep` must pass WCAG AA in both modes. Test before merge.
- `accent` (clay) on `bg` for body links: `#C46A4A` on `#F4EDD9` is borderline at 17px. If contrast testing fails, fall back to **`#A9583E`** for body links specifically (still warm, AA at 17px).
- `signal` is **never** used for body text on either background.
- Focus rings: 2px solid `accent` at 2px offset on every interactive element. Never removed.
- `prefers-reduced-motion: reduce` disables all transitions and scroll-triggered animations.

## 7. Typography

### 7.1. Stack

| Role | Family | Fallback |
|---|---|---|
| Display + body (serif) | **Source Serif 4** | `'Iowan Old Style', 'Source Serif Pro', Georgia, serif` |
| Mono (kickers, meta, code, captions) | **Geist Mono** | `ui-monospace, SFMono-Regular, monospace` |
| UI / nav (sans) | **Geist Sans** | `ui-sans-serif, system-ui, sans-serif` |

Lato is removed. Inter (proposed in brand-foundation §3) is dropped — Source Serif handles long-form, Geist Sans handles UI, no third family is needed.

### 7.2. Scale (rem, base 16px)

| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `display-hero` | 3.75rem (60px) | 1.02 | 600 | Homepage hero headline |
| `display-h1` | 2.75rem (44px) | 1.05 | 600 | Article H1 |
| `h2` | 1.75rem (28px) | 1.15 | 600 | Article H2, homepage section titles |
| `h3` | 1.25rem (20px) | 1.3 | 600 | Article H3, card titles |
| `deck` | 1.1875rem (19px) | 1.45 | 400 italic | Italic deck under headlines |
| `body` | 1.0625rem (17px) | 1.7 | 400 | Article body |
| `body-sm` | 0.9375rem (15px) | 1.55 | 400 | Cards, secondary blocks |
| `meta` | 0.75rem (12px) | 1.5 | 500 | Mono kickers, dates, fig captions |
| `ui` | 0.875rem (14px) | 1.5 | 500 | Sans-serif nav and UI |

### 7.3. Typographic motifs

- **Article-number kicker**: mono `// 13` in `text-soft`, with the number coloured `accent`.
- **Italic decks**: serif italic, one sentence, ≤25 words.
- **Figure captions**: mono `FIG. 01 · description`, number in `accent`.
- **Equation labels**: mono `EQ. 01`, number in `accent`. Separate counter from figures.
- **Section labels**: mono `// RECENT`, `// ARCHIVE`, `// 2025`. The word after `//` is in `accent`.
- **Sentence-case headings always.** Title Case is retired.

## 8. Layout

### 8.1. Width tiers

Articles use three width tiers. Embeds opt into a tier via a `tier` prop on `<Figure>`.

| Tier | Max | Used by |
|---|---|---|
| `prose` | 640px | Paragraphs, lists, blockquotes, inline code, default text |
| `wide` | 880px | Code blocks, KaTeX block equations, GitHub project cards, side-by-side images |
| `bleed` | 1080px | Hero figures, full-width interactive canvases, large diagrams |

Site chrome (topbar, footer) max-width: 1200px.

### 8.2. Grid and spacing

- Baseline grid: 8px. Everything snaps.
- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. No in-between values.
- Section vertical rhythm: 96px desktop, 64px tablet, 48px mobile.
- Article H2 → next paragraph: 48px above heading, 18px below.
- Hero margins: 72px top, 56px bottom on desktop.

## 9. Page architecture

### 9.1. Homepage (`/`)

Three sections, in order:

1. **Topbar** — logo lockup `Kochie Engineering / Blog` (slash in `accent`), sans nav (`Index`, `Tags`, `About`, `RSS`), theme toggle on the right.
2. **Hero feature** — `bleed`-tier section, 1.4 : 1 grid: text on the left (mono kicker → `display-hero` headline → italic deck → mono meta → "Read the essay →" CTA with `accent`-bordered button), figure on the right (a representative diagram or image at 320px height). Mobile: figure stacks above text.
3. **Recent essays** — `// RECENT · also worth your time` section label. 3-card row. Each card: thumbnail (160px height, article-specific) → mono `// number` → serif `h3` title → italic `body-sm` blurb → mono meta. Hover: translateY(-2px), title shifts to `accent`.
4. **Archive** — `// ARCHIVE · all essays, by year` section label. Year groupings. Each row: 4-column grid `[mono number | serif title + blurb | mono tags | mono read-time + date]`. Hover: subtle `accent` tint background.
5. **Footer** — minimal: mono links (RSS, JSON feed, Subscribe, About, GitHub), one line `Part of Kochie Engineering →` to kochie.io.

### 9.2. Article page (`/article/[slug]`)

- Hairline scroll-progress bar pinned to top of viewport (2px height, `accent` → `signal` linear gradient, fills with scroll).
- Optional sticky TOC in the left margin on screens ≥1280px wide. On smaller screens, collapses to a top-of-article disclosure: "In this piece (5 sections) ▾".
- Article opening (in this exact order):
  1. Mono kicker: `// {number} · {top tag, uppercase} · {secondary tag, optional}`.
  2. Serif `display-h1`, sentence case.
  3. Italic serif `deck`, ≤25 words.
  4. Mono meta line: `By Rob Koch · {published date} · {read time} · updated {date}` (`updated` shown only if ≥14 days after published).
  5. Optional hero figure (`bleed` tier) — only if the article has a meaningful one. Defaults to none.
  6. First paragraph (the hook).
- Body in `prose` tier; figures break out to `wide` or `bleed`.
- Article footer: prev/next post (chronological), 2-card row with mini-thumbnails. Below: 2-3 related-by-tag suggestions.

### 9.3. Archive page (`/archive`)

The same archive list from the homepage, standalone. Year-grouped by default. Filter chips at top by tag.

### 9.4. Tag page (`/tags/[tag]`)

Same archive list, filtered. Top of page: tag name as `display-h1`, italic deck explaining the tag (writer-supplied or auto-derived from article blurbs). No hero feature on tag pages.

### 9.5. About / author page (`/authors/[slug]` for Rob)

Out of scope for this redesign beyond inheriting the new typography. Existing component stays but uses the new tokens.

## 10. The article opening pattern

Every article opens with this sequence, in this order, with no exceptions:

1. Mono kicker
2. Serif H1
3. Italic deck
4. Mono meta line
5. Optional hero figure (default: none)
6. First paragraph (the hook)

This is the rule that gives the publication its rhythm. The deck is a one-sentence orientation for readers who need more context before committing. The hook lives in the first paragraph and is meant to land hard, per the existing `articles/article-blueprint.md`.

## 11. The unified figure frame

The single most important component in the system.

```jsx
<Figure tier="prose | wide | bleed" caption="..." source="..." kind="image | code | video | tweet | linkedin | spotify | github | equation | canvas | quote">
  {children}
</Figure>
```

### 11.1. Behaviours

- Auto-numbers per article, one counter for figures (`FIG. 01`, `FIG. 02`, …) and a separate counter for equations (`EQ. 01`, `EQ. 02`).
- `caption` rendered in mono below the embed, number coloured `accent`.
- Optional `source` rendered as a smaller mono attribution line under the caption.
- `tier` sets max-width and centers the frame.
- Frame styling: 1px border in `rule`, 4px radius, no shadows.
- All embed types render inside this. The frame is what makes a tweet, a code block, and a KaTeX equation feel like siblings.

### 11.2. Per-embed treatments

- **Image** (`kind="image"`) — preserves the existing `?width=X&height=Y` markdown convention. Width clamps to tier max.
- **Code block** (`kind="code"`) — `bg-deep` surface, `signal` filename in mono header, language label right-aligned in `text-soft`. Custom syntax theme: `accent` (clay) for keywords, `signal` for strings, italic `text-soft` for comments, `text-mute` for identifiers, `accent` darkened (`#A9583E` light / `#E89D7E` dark) for functions.
- **KaTeX block** (`kind="equation"`) — `wide` tier by default. Generous vertical padding. Right-margin `EQ. 01` label. Inline KaTeX (within prose) is unframed.
- **Video / mp4** (`kind="video"`) — keeps existing autoplay/loop/muted props. Adds `tier`.
- **Tweet** (`kind="tweet"`) — wraps `react-tweet`. Existing props pass through.
- **LinkedIn** (`kind="linkedin"`) — wraps `LinkedInEmbed`. Existing props pass through.
- **Spotify** (`kind="spotify"`) — replaces raw iframe usage in articles. Same props.
- **GithubProject** (`kind="github"`) — `wide` tier, `accent`-bordered card with repo description and stars.
- **Pull-quote** (`kind="quote"`) — `Quote` component, left-bordered with 2px `signal` stripe, italic 24px serif, `text` colour, attribution in mono `text-soft`.
- **Interactive canvas** (`kind="canvas"`) — wraps `Canvasses`. `// interactive` marker top-left in mono `accent`. `wide` or `bleed` tier.

## 12. Component inventory (current → new)

| Status | Component | Notes |
|---|---|---|
| **Replace** | `Jumbotron` | Replaced on homepage by `HeroFeature`. Article hero images use `Figure` instead. |
| **New** | `HeroFeature` | Homepage hero per §9.1. Picks article via `featured: true` frontmatter, defaults to most recent. |
| **New** | `RecentRow` | 3-card recent-essays row. |
| **New** | `ArchiveList` | Year-grouped numbered list. Used on homepage section and `/archive`. |
| **Restyle** | `Topbar` | Logo lockup with `/` slash mark in `accent`, sans nav, theme toggle, RSS link. |
| **Restyle** | `Footer` | Minimal: mono links, "Part of Kochie Engineering →" line. |
| **New** | `Figure` | The unified frame. Wraps all embeds. Auto-numbers. |
| **Modify** | `CodeBlocks` | Update theme to clay/signal/text-soft/text-mute palette. |
| **Modify** | `Quote` | Restyle per §11.2. |
| **Modify** | `Tweet`, `LinkedInEmbed`, `Video`, `GithubProject` | Wrap in `Figure`; expose `tier` prop. |
| **New** | `Equation` | KaTeX wrapper with `EQ.` counter. |
| **New** | `Canvas` | Wraps existing `Canvasses`; standardises framing. |
| **New** | `TOC` (sidebar variant) | Sticky left-margin TOC on screens ≥1280px. Active section highlighted in `accent`. |
| **New** | `ScrollProgress` | Hairline gradient bar at top of viewport. |
| **New** | `Sidenote` | Margin-rendered note on desktop, inline disclosure on mobile. |
| **Restyle** | `Tag`, `ArticleCards`, `Gallery` | `Gallery` becomes the homepage `RecentRow`/`ArchiveList` composition. `Tag` restyled to mono pill. `ArticleCards` becomes part of `RecentRow`. |
| **Restyle** | `Theme` button | Stays; restyled. |
| **Keep** | `MDXWrapper`, MDX pipeline, rehype/remark plugins | No changes. |
| **Restyle** | `Article` page layout | Reorder opening to match §10 (kicker → H1 → deck → meta → optional hero → first paragraph). Wire up TOC + ScrollProgress + Sidenote slots. |
| **Keep** | Frontmatter shape | Add optional `featured: boolean` field; all existing fields work unchanged. |
| **Keep** | Sentry, Fathom analytics, Theme provider, instrumentation | No changes. |
| **Keep** | `KochieEngineeringLogo.svg` and `blog-logo.svg` | No changes. |

## 13. Reading scaffolding

Designed for 10-minute essays.

- **Sticky sidebar TOC** on screens ≥1280px wide. Hidden on smaller screens (collapsed disclosure at top of article: "In this piece"). Active section highlighted with `accent` left border + colour. Auto-built from H2/H3 in MDX.
- **Scroll progress bar** at viewport top: 2px height, `accent` → `signal` linear gradient, fills with scroll position.
- **Anchored headings**: every H2/H3 is a copy-link target. Hover reveals `§` mark in `accent` to the left.
- **Sidenotes**: superscripted reference in body (e.g. `¹`), full note rendered in the right margin on desktop, inline disclosure on mobile. New `<Sidenote>` MDX component.
- **Prev/Next**: at article end, 2-card row with previous and next chronological essay (mini-thumbnail, number, title).
- **Read time + updated date**: always visible in meta line. `updated` only renders if ≥14 days after `publishedDate`.

## 14. Light / dark mode

- Default mode: **dark**.
- Persistence: existing `ThemeProvider` keeps the user choice in `localStorage`. No changes to the persistence mechanism.
- Implementation: all tokens defined as CSS custom properties on `:root` and `:root[data-theme="light"]`. Tailwind 4 reads from these via `@theme`.
- Every figure type, illustration, and chrome element must render well in both modes. No dark-only or light-only design elements.

## 15. Motion

- Default duration: **150ms** for small surfaces (hover, focus, link), **250ms** for larger surfaces (theme switch, drawer).
- Default easing: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo).
- Where motion lives:
  - Card hover: `translateY(-2px)`.
  - TOC active state: colour and border slide.
  - Scroll progress: width fills.
  - Theme switch: 250ms cross-fade.
  - Anchor link `§` reveal on heading hover: opacity.
- Where motion does **not** live:
  - Hero text — never scroll-triggered.
  - Diagrams — animate only on user interaction, never on scroll-into-view.
  - Code blocks — never animate.
  - Page transitions — none.

## 16. Accessibility checklist

- All body text passes WCAG AA on its background. Document the verified pairs.
- `clay` on `cream paper` for body links: if AA fails at 17px, fall back to `#A9583E`.
- `signal` never used for body text.
- Focus rings: 2px solid `accent` at 2px offset on every interactive element.
- `prefers-reduced-motion: reduce` disables all transitions and scroll-driven motion.
- TOC keyboard-navigable.
- Skip-to-content link is the first focusable element on every page.
- Sidenotes available via `aria-describedby` and announced by screen readers.
- All interactive targets ≥44×44px on mobile.

## 17. What we are explicitly retiring

- The PCB-image jumbotron homepage.
- Lato as the primary font.
- The "terminal green on near-black" direction proposed in `docs/02-visual-identity.md` §2 (sub-brand accent for blog).
- Cool-slate base tokens (`#0B0F14`, `#2A3340`, etc.) on the blog. Cool versions of the master tokens may still appear elsewhere in the family (Touch Typer's existing teal, etc.).
- The `// section name` comment kicker proposed in `docs/02-visual-identity.md` §3.3 — kept the *form* but reassigned semantics: now `// 13` for article numbers and `// ARCHIVE` for section labels.

## 18. Out of scope

- kochie.io, me.kochie.io, touch-typer.kochie.io redesigns.
- Search.
- Newsletter brand naming ("Field Notes" vs "scream into the void" vs other) — tracked in `01-brand-foundation.md` §10.
- New illustrations for existing articles.
- Multi-author support.
- An RSS-reader-friendly content adapter.

## 19. Open questions (pre-implementation)

These are decided enough to proceed, but flagged for the implementation plan to surface.

- **Source Serif 4 vs Newsreader** for the body face. Recommendation: Source Serif 4. Alternate: Newsreader (slight optical-size advantage). A/B in light staging once the system renders.
- **Article default hero figure**: when an article has no explicit hero, do we show *nothing* (current spec) or auto-generate a typographic numeral on warm soot (`// 13` at display size)? Recommendation: nothing, keep the opening text-led.
- **Tag page hero**: do tag pages get a hero feature mechanic (canonical article per tag) or stay archive-only? Recommendation: stay archive-only for v1.
- **Light-mode `clay` body-link contrast**: pre-test before merge. If AA fails, the spec falls back to `#A9583E`.

## 20. Decision log (what was rejected and why)

- **Terminal green / coding-forward** — explicitly user-rejected ("not what I like"). The blog wants editorial register, not code-IDE register.
- **Pure black background** — reads computery, breaks the warmth principle. Replaced by warm soot `#1A1815`.
- **Cool wire blue as primary blog accent** — too SF-glossy alongside warm paper. Replaced by clay `#C46A4A` for the blog (wire blue stays as a master token for other properties).
- **Press / magazine-front register as the article body style** — bold magazine treatments don't help 10-minute reads. Press swagger reserved for the homepage hero.
- **Pure index-first homepage (no hero)** — index-only is too archival for a thought-leadership blog. The hero feature carries editorial weight; the archive carries engineering rigor. Both belong.
- **Multiple accent colours per page** — violates the brand-doc rule that each property gets one accent.

---

*Locked direction: Field Journal. Next: implementation plan.*
