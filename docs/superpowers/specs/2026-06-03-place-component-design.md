# Place Component Design

**Date:** 2026-06-03  
**Status:** Approved

## Overview

A new `<Place>` MDX component for journal entries. It wraps a place name as a hyperlink and optionally appends small FontAwesome icon-links for Instagram and/or a map URL. Inline — does not break text flow.

## Usage

```mdx
<Place link="https://www.harpandhound.com.au/" instagram="harpandhoundbar" map="https://maps.apple.com/?q=Harp+and+Hound">
  Harp and Hound
</Place>
```

Any combination of optional props works:

```mdx
<!-- Website + Instagram only -->
<Place link="https://www.harpandhound.com.au/" instagram="harpandhoundbar">Harp and Hound</Place>

<!-- Website only -->
<Place link="https://www.harpandhound.com.au/">Harp and Hound</Place>
```

## Props

| Prop        | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `children`  | string | yes      | The place name — rendered as link text. Typed as `string` (not `ReactNode`) so it can be used in `aria-label` construction. |
| `link`      | string | yes      | Primary URL (website). Wraps `children`. |
| `instagram` | string | no       | Instagram handle (without `@`). Adds icon linking to `https://instagram.com/<handle>`. |
| `map`       | string | no       | Full map URL (Google Maps, Apple Maps, `geo:` URI, etc.). Adds a map-pin icon linking to that URL. The `aria-label` always reads `"<name> on Maps"` regardless of URL provider. |

## Rendered output

```
[Harp and Hound] [instagram icon] [map pin icon]
  ^-- link          ^-- link           ^-- link
```

- The place name text is a `next/link` linking to `link`, styled with `font-mono text-sm text-accent underline`.
- Each optional icon is a separate `next/link` (or `<a>` for external URLs) with an `aria-label`, opening in a new tab.
- Icons only render when the corresponding prop is provided.

## Visual style

- **Wrapper:** `inline-flex items-center gap-1.5`
- **Place name link:** `font-mono text-sm text-accent underline underline-offset-2`
- **Icon links:** `text-[0.75em] text-text-mute hover:text-accent transition-colors`

## Icons (FontAwesome)

| Purpose   | Icon            | Import path                              |
|-----------|-----------------|------------------------------------------|
| Instagram | `faInstagram`   | `@fortawesome/free-brands-svg-icons`     |
| Map       | `faLocationDot` | `@fortawesome/free-solid-svg-icons`      |

Both packages are confirmed present in `package.json`. `FontAwesomeIcon` is used without `'use client'` in existing components (e.g. `Quote`) registered in the same server-component file — `Place` follows the same pattern.

## Files to create / modify

| File | Action |
|------|--------|
| `src/components/Place/index.tsx` | Create — the component |
| `src/components/MDXWrapper/components.tsx` | Modify — add `Place` to the `components` map |

## Accessibility

- Icon links have descriptive `aria-label`s: `"<name> on Instagram"`, `"<name> on Maps"`.
- The name link has no additional `aria-label` — its text content is already descriptive.
- All links get `target="_blank" rel="noopener noreferrer"`.

## Scope note: journal feed

`<Place>` is an MDX component — it only renders in the full single-entry page (`/journal/[slug]`), which uses the MDX component map. The journal feed (`JournalEntryCard`) renders pre-compiled HTML via `dangerouslySetInnerHTML` and will not render `<Place>` — the tag will be stripped silently. This is expected and acceptable for now.

## Out of scope

- Block/card display mode
- Hover popover
- Auto-constructing map URLs from a place name
