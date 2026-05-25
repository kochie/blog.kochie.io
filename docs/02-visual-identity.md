# Kochie Engineering — Visual Identity Guide

*The "how it looks" companion to `01-brand-foundation.md`. Opinionated. Implementable in Tailwind in an afternoon.*

---

## 1. Design principle

> **Engineering, not "techy".**

Most personal-engineer brands fall into one of two visual traps: (a) generic SaaS gradient soup, or (b) maximalist "look at my terminal" cyberpunk. Kochie Engineering should look like *the engineering itself* — clean, exact, slightly utilitarian, with enough warmth to remind you a person made it. Think the visual register of *Stripe docs*, *Linear*, *Vercel*, *Geist UI* — but with a Melbourne softness rather than San Francisco gloss.

Three rules for every design decision:

1. **Type does most of the work.** Strong typographic system; minimal ornament.
2. **One signal colour, used sparingly.** Restraint reads as confidence.
3. **The mono font is a brand asset, not a cliché.** Use it deliberately for code, metadata, and small accents — not as decoration.

## 2. Colour system

### Master palette — Kochie Engineering

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0B0F14` | Primary text on light, primary background on dark |
| `paper` | `#F7F6F1` | Primary background on light, primary text on dark. Slight warm cast keeps it from feeling sterile |
| `signal` | `#E8FF3F` | The one accent. Electric/hazard yellow. CTAs, hover states, key highlights |
| `wire` | `#1F4FFF` | Secondary accent. Use for links, code-token highlights, info states |
| `steel-700` | `#2A3340` | UI chrome on dark, borders, disabled states |
| `steel-300` | `#C7CDD4` | Borders on light, secondary text |
| `steel-100` | `#EDEEF0` | Subtle surfaces, table stripes, code block bg on light |

**Rationale.** The yellow does several jobs at once: it nods to electrical engineering (Rob's actual background), reads as energetic without being childish, and is rare enough in dev brands that it'll be recognisable. The blue is a safety valve for any context where yellow doesn't have enough contrast (it has WCAG AA issues on white at small sizes — see §6).

**Modes.** Build dark-first. Most of your audience reads in dark mode anyway, and the existing blog imagery (PCB green-on-dark) already cues that. Light mode is the polite fallback.

### Sub-brand accents

Each property keeps the master ink/paper/type system. They differ by **one accent colour** and **one motif**. That's it.

| Property | Accent | Hex | Motif |
|---|---|---|---|
| **kochie.io** (master) | `signal` yellow | `#E8FF3F` | Faint grid background; mono callouts |
| **me.kochie.io** | `coral` warm | `#F26D5B` | Hand-drawn arrows, photographs, more whitespace |
| **blog.kochie.io** | `terminal` green | `#00D17A` | Code-block prominence, article numbers in mono, `//` and `>` flourishes |
| **touch-typer.kochie.io** | `key` teal | `#0E7C7B` (honour existing logo) | Keyboard imagery, layered haikei waves stay |

The system reads as a family because: same ink/paper, same fonts, same grid, same iconography. The accent is the only thing each sub-brand gets to negotiate.

### Future products

When MetaFixer (or the next product) graduates to its own marketing site, give it one accent and add a row to this table. Don't reach for gradients or multiple "brand colours" per product. One. Always one.

## 3. Typography

### The stack

| Role | Family | Fallback | Where |
|---|---|---|---|
| **Display + UI** | **Geist Sans** | `ui-sans-serif, system-ui` | Headings, buttons, nav |
| **Body (long-form)** | **Inter** | `ui-sans-serif, system-ui` | Blog article body, prose paragraphs over ~200 words |
| **Mono (accent + code)** | **Geist Mono** | `ui-monospace, SFMono-Regular, monospace` | Code blocks, metadata, lockups, small UI labels |

Geist + Geist Mono are open source, sit cleanly together, and are first-class on Vercel/Next.js — which all four sites are already on. Inter is overkill *next to* Geist Sans in headings; the reason to keep it for blog body is that Inter has slightly better long-form rhythm at 17–18px.

If you'd rather standardise on one: drop Inter and use Geist Sans everywhere. The hit is small.

### Type scale (rem, base 16px)

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `display-xl` | 4.5rem | 1.05 | 600 | Hero on kochie.io / me.kochie.io |
| `display-lg` | 3rem | 1.1 | 600 | Section headers |
| `h1` | 2.25rem | 1.15 | 600 | Article H1 |
| `h2` | 1.625rem | 1.25 | 600 | Section H2 |
| `h3` | 1.25rem | 1.3 | 600 | Subsection |
| `body-lg` | 1.125rem | 1.65 | 400 | Article body |
| `body` | 1rem | 1.55 | 400 | UI body |
| `small` | 0.875rem | 1.5 | 400 | Metadata, footer |
| `mono-sm` | 0.875rem | 1.5 | 500 | Inline code, tags, captions |

### Typographic motifs

These are the "small things that make it feel like Kochie Engineering":

- **Article numbers in mono.** Blog posts already number themselves (`13-lambda-recursion`). Surface that — `// 13` as a mono kicker above the H1.
- **Comment-style kickers.** Use `// section name` in mono above section headers on the master and blog sites. Not on the product or personal sites — would feel forced there.
- **Mono for metadata.** Dates, read-time, tags, file paths, IDs — all mono.
- **Sentence-case headings.** Always. Title Case Looks Corporate.

## 4. Logo system

### Master mark

Keep the existing `KochieEngineeringLogo.svg` as the master mark. It already does the work and has equity across kochie.io and the blog. Don't redesign it without a reason.

### Lockup variants

```
Primary lockup        [mark]  Kochie Engineering
Compact (favicon)     [mark]
Wordmark only         Kochie Engineering        (Geist Sans, 600)
Mono wordmark         kochie::engineering       (Geist Mono, 500) — for footers, conference slides, signatures
Sub-property lockup   [mark]  Kochie Engineering / Blog
                       [mark]  Kochie Engineering / Touch Typer
```

The slash is the brand-architecture cue. Use it consistently in headers and footers across the family.

### Touch Typer logo

Keep the existing Touch Typer mark — it's already shipped on the App Store / Snap Store, and reskinning it now would cost more than it'd earn. In its marketing site footer, add `Touch Typer is part of Kochie Engineering →` with a link back to kochie.io. That's the integration.

### Clearspace and minimum size

- Clearspace = the height of the "K" in the wordmark, on all sides.
- Minimum size: 24px tall for digital, 12mm for print.
- Never put the mark on a busy photo without a solid plate behind it.

## 5. Layout, grid, spacing

- **Baseline grid:** 8px. Everything snaps.
- **Spacing scale:** `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. No in-between values.
- **Content widths:**
  - Prose: `max-width: 68ch` (≈720px at body-lg). The blog article body should be this.
  - UI / landing: `max-width: 1200px`.
  - Hero / wide visuals: full-bleed allowed, contained content still respects 1200px.
- **Section rhythm:** Vertical space between major sections = 96px desktop, 64px tablet, 48px mobile. Consistency here is what separates "engineered" from "thrown together".

## 6. Accessibility & contrast

- **Body text:** must hit WCAG AA on its background. `ink` on `paper` and `paper` on `ink` both pass comfortably.
- **Signal yellow** does *not* pass AA on `paper` for body text — only use it for: (a) large display elements, (b) backgrounds with `ink` text on top, (c) iconographic accents. Never for body copy on white.
- **Wire blue (`#1F4FFF`)** is the AA-safe link colour on `paper`.
- **Focus states:** 2px outline in `signal` on dark, `wire` on light, with 2px offset. Never remove focus rings.

## 7. Iconography

- **Library:** [Lucide](https://lucide.dev) (open source, Geist-aligned aesthetic) or [Phosphor](https://phosphoricons.com).
- **Stroke:** 1.5px, rounded caps and joins.
- **Sizing:** 16, 20, 24px. Keep one size within a single component.
- **Don't mix icon libraries.** Pick Lucide and stay.

## 8. Imagery

- **Photography:** when used (me.kochie.io, blog post heroes), prefer natural light, slight grain, real environments. The City2Surf photo on me.kochie.io is exactly the right register — keep that energy. Avoid stock-tech photography (server racks, abstract data viz, hooded coders).
- **Illustration:** use sparingly, and keep it line-based / monochrome with a single accent fill in the relevant sub-brand colour.
- **Diagrams:** treat them as primary content. The blog earns its credibility partly on whether the diagrams are good. Use the `signal`/`wire` palette for highlight strokes; `steel` greys for everything else.
- **No emoji as decoration.** Emoji is fine in casual prose but not as section markers or button content.

## 9. Code blocks

Code blocks are some of the most-viewed surfaces on the entire brand (the blog is a code-heavy site). Treat them like a first-class design element.

- **Theme:** pick one syntax theme and use it across all four properties. **Recommendation: a custom Kochie Engineering theme** based on:
  - Background: `#0B0F14` (`ink`) on dark, `#0F1218` (slightly off-ink for separation) inside articles
  - Comments: `#6E7782`
  - Strings: `#E8FF3F` (signal)
  - Keywords: `#1F4FFF` (wire)
  - Functions/identifiers: `#F26D5B` (coral, only here — borrows from me sub-brand for warmth)
  - Constants/numbers: `#00D17A` (terminal green)
- **Or use Catppuccin Mocha** as a no-effort starting point and override the accent tokens with your palette over time.
- **Always show language label** in mono, top-right of the block, in `steel-300`.
- **Filename header**, when relevant, in mono, above the block, in `signal`.

## 10. Motion

- **Default duration:** 150–250ms.
- **Default easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo-ish — feels decisive).
- **Where motion belongs:** focus states, hover/press feedback, drawer/modal open, view transitions on the blog.
- **Where it doesn't:** hero elements moving on scroll for no reason, animated gradients, type that flies in. Engineering brands don't need to dance.

## 11. Implementation hand-off

For when this becomes Tailwind config:

```ts
// tailwind.config.ts (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        ink:    '#0B0F14',
        paper:  '#F7F6F1',
        signal: '#E8FF3F',
        wire:   '#1F4FFF',
        steel: {
          100: '#EDEEF0',
          300: '#C7CDD4',
          700: '#2A3340',
        },
        // sub-brand accents
        coral:    '#F26D5B', // me.kochie.io
        terminal: '#00D17A', // blog.kochie.io
        key:      '#0E7C7B', // touch-typer.kochie.io
      },
      fontFamily: {
        sans:    ['Geist', 'ui-sans-serif', 'system-ui'],
        mono:    ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        body:    ['Inter', 'ui-sans-serif', 'system-ui'], // optional, blog only
      },
      maxWidth: {
        prose: '68ch',
        ui:    '1200px',
      },
    },
  },
}
```

## 12. What a page looks like, in three rules

1. **Ink on paper, mono for the metadata, signal yellow for the one thing you actually want clicked.**
2. **Sentence-case heading, generous line-height, and 68ch prose width.**
3. **Code block does heavy lifting if there's code; photo does heavy lifting if it's me.kochie.io; nothing else asks for attention.**

That's the visual identity. Everything else is taste.

---

*Companion documents: `01-brand-foundation.md`, `03-per-site-positioning.md`.*
