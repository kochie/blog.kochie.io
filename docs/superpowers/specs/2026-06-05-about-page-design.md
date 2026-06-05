# /about Page Design

**Date:** 2026-06-05  
**Status:** Approved  

## Goal

Add a focused `/about` page to blog.kochie.io that establishes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals for Google, gives every article a real author URL to point to, and shows readers a snapshot of who wrote what they're reading. It is not a second personal homepage — `me.kochie.io` handles that. This page is functional, credible, and informative.

---

## Content Sections

The page is a single prose-width column (matches article page width). Top to bottom:

1. **Header** — 80px circular avatar, full name, "Software Engineer · Melbourne", `me.kochie.io ↗` external link, social icon row. All data sourced from `metadata.yaml → authors.kochie`.

2. **Bio** — The existing `authors.kochie.bio` paragraph, rendered as-is.

3. **`// WRITING HISTORY`** — Weekly publication heatmap:
   - Rows = years (2021 → current year), columns = ISO weeks 1–52
   - Each cell = number of articles published in that week (articles only, not journal entries)
   - Color scale uses the site's CSS `--color-accent` (blue) rather than green
   - Four intensity levels: empty, low (1), medium (2), high (3+)
   - Pure server-rendered `<div>` grid — no client JS required
   - Each cell carries a `title` attribute: "Week of [Mon DD YYYY]: N article(s)" for native browser hover tooltip

4. **`// WRITING THEMES`** — Top 6 tags by article count, displayed as monospace chip elements (same visual style as existing tag pages).

5. **`// SELECTED WRITING`** — 3 hand-picked articles. Slugs stored in `metadata.yaml` under `about.featuredArticles`. Each row: thumbnail image + title + publish date + primary tag.

6. **`// RECENT WRITING`** — 3 most recent articles by `publishedDate`, excluding any article already shown in Selected Writing. Same row layout as Selected Writing.

---

## Data Changes

### `metadata.yaml`

Add a new top-level key:

```yaml
about:
  featuredArticles:
    - slug-one
    - slug-two
    - slug-three
```

Slugs match `articleDir` values in the existing article frontmatter.

### `types/metadata.d.ts`

The `Metadata` type currently has `authors` and `tags` only. Extend it with:

```ts
about?: {
  featuredArticles: string[]
}
```

Without this change, TypeScript will error when `buildMetadata()` is used to access `about.featuredArticles`.

---

## New Files

### `src/app/about/page.tsx`

Async server component. Responsibilities:

Make exactly **two data calls** at the top of the function:
1. `buildMetadata()` — returns `{ authors, tags, about, articles }`. Use for author data (`authors.kochie`) and featured article slugs (`about.featuredArticles`). Note: `buildMetadata().articles` contains only article matter (no LQIP / thumbnail data) — do not use it for rendering article rows.
2. `getAllArticlesMetadata()` — returns full article metadata including LQIP blur data URLs needed for `<Image placeholder="blur">`. Use this for all article row rendering (featured, recent, heatmap).

Then:
- Compute the heatmap grid (see Heatmap section below)
- Resolve featured articles: filter `getAllArticlesMetadata()` results by slugs in `about.featuredArticles`, preserving the order in the YAML array
- Resolve recent articles: sort all articles descending by `publishedDate`, filter out any whose `articleDir` appears in `about.featuredArticles`, take first 3
- Derive writing themes: use the existing exported `getUsedTags(articles, tags)` from `src/lib/article-path.ts`, sort by usage count descending, take top 6
- Render the page with `ProfilePage` JSON-LD (see SEO section below)

**Avatar URL:** `authors.kochie.avatar.src` is a bare filename (e.g. `kochie.png`). The public URL is `/images/authors/${author.avatar.src}` — consistent with how `AuthorCardLeft` and `ArticlePage` render avatars. No LQIP is needed for the about page avatar.

No new shared components are introduced. The heatmap grid, article rows, and tag chips are inline JSX within the page, following the same patterns used in other pages.

### `src/app/about/opengraph-image.tsx`

OG image for the `/about` route, consistent with all other routes on the site. Displays name and tagline against the standard site background. Follow the pattern in `src/app/archive/opengraph-image.tsx` as the reference — it uses `src/lib/og-template.tsx` and `src/lib/og-fonts.ts` directly.

---

## Modified Files

### `src/app/sitemap.ts`

Add to the `routes` array:

```ts
{
  url: 'https://blog.kochie.io/about',
  lastModified: new Date().toISOString(),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
}
```

### `src/app/articles/[articleId]/page.tsx` — `generateMetadata`

Add `authors` to the returned metadata object so every article links back to the about page:

```ts
authors: [{ name: author.fullName, url: '/about' }],
```

---

## SEO & Metadata

### `generateMetadata` (or exported `metadata` constant)

```ts
{
  title: 'About',                          // renders as "About | Kochie Engineering"
  description: authors.kochie.bio,         // from metadata.yaml
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    url: '/about',
    title: 'About | Kochie Engineering',
    description: authors.kochie.bio,
    siteName: 'Kochie Engineering',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Kochie Engineering',
    description: authors.kochie.bio,
  },
}
```

### JSON-LD — `ProfilePage` schema

Injected via `<script type="application/ld+json">` in the page component:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Robert Koch",
    "url": "https://blog.kochie.io/about",
    "description": "<bio text>",
    "sameAs": [
      "https://bsky.app/profile/kochie.bsky.social",
      "https://twitter.com/kochie",
      "https://linkedin.com/in/rkkochie",
      "https://melb.social/@kochie",
      "https://me.kochie.io"
    ]
  }
}
```

The `sameAs` array is derived from `authors.kochie.socialMedia` links in `metadata.yaml` plus `me.kochie.io`. Filter out any entry whose `link` starts with `mailto:` — email addresses are not valid `sameAs` targets per schema.org.

---

## Heatmap Implementation Detail

The heatmap is computed entirely at render time on the server. No client component wrapper needed.

**Week calculation:** Use ISO week numbering. For each article, compute `(publishedDate → ISO year, ISO week)` using a helper:
```ts
function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    year: d.getUTCFullYear(),
    week: Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
  }
}
```
Build a `Map<year, Map<week, count>>`. Outer loop: years ascending from 2021 to `new Date().getFullYear()`. Inner loop: weeks **1–53** (not 1–52). ISO years occasionally have week 53 (e.g. 2026 does); capping at 52 silently drops articles published in week 53. Render 53 columns for every year row for consistency; week-53 cells will simply be empty in years that only have 52 weeks.

**Color mapping (using Tailwind/CSS):**
- 0 articles: `bg-surface` (dark neutral)  
- 1 article: accent at 25% opacity  
- 2 articles: accent at 60% opacity  
- 3+ articles: accent at 100% opacity  

**Cell dimensions:** 13×13px, 3px gap between cells, matching the GitHub visual rhythm shown in the reference screenshot.

**Month labels:** Render a label row above each year's week columns. The offset (in cells) for each month's label is derived from the ISO week number of the first day of that month for the given year:
```ts
function firstIsoWeekOfMonth(year: number, month: number): number {
  // month is 0-indexed
  return isoWeek(new Date(year, month, 1)).week
}
```
Position each label by setting `grid-column-start` to `firstIsoWeekOfMonth(year, month)`. Labels that would overlap (< 3 columns of space before the next) can be omitted.

---

## Out of Scope

- Interactive tooltips beyond native `title` attribute hover
- Filtering or clicking cells to navigate to articles
- Journal entries in the heatmap
- Any content not already in `metadata.yaml` or article frontmatter
