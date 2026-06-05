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

---

## New Files

### `src/app/about/page.tsx`

Async server component. Responsibilities:

- Call `buildMetadata()` to get author data and the full article list
- Call `getAllArticlesMetadata()` for article details (thumbnails, tags, dates)
- Compute the heatmap grid: for each year from 2021 to current year, for each ISO week 1–52, count articles published in that week
- Resolve featured articles by matching `about.featuredArticles` slugs against the article list
- Resolve recent articles: sort all articles descending by date, filter out featured ones, take first 3
- Derive writing themes: aggregate tag counts across all articles, take top 6 by frequency
- Render the page with `ProfilePage` JSON-LD (see SEO section below)

No new shared components are introduced. The heatmap grid, article rows, and tag chips are inline JSX within the page, following the same patterns used in other pages.

### `src/app/about/opengraph-image.tsx`

OG image for the `/about` route, consistent with all other routes on the site. Displays name and tagline against the standard site background.

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

The `sameAs` array is derived from `authors.kochie.socialMedia` links in `metadata.yaml` plus `me.kochie.io`.

---

## Heatmap Implementation Detail

The heatmap is computed entirely at render time on the server. No client component wrapper needed.

**Week calculation:** Use ISO week numbering. For each article, compute `(publishedDate → ISO year, ISO week)`. Build a `Map<year, Map<week, count>>`. Render a `<div>` grid: outer loop over years (ascending), inner loop over weeks 1–52.

**Color mapping (using Tailwind/CSS):**
- 0 articles: `bg-surface` (dark neutral)  
- 1 article: accent at 25% opacity  
- 2 articles: accent at 60% opacity  
- 3+ articles: accent at 100% opacity  

**Cell dimensions:** 13×13px, 3px gap between cells, matching the GitHub visual rhythm shown in the reference screenshot.

**Month labels:** A row of abbreviated month names (Jan–Dec) positioned above the week columns using the same 13px + 3px grid math.

---

## Out of Scope

- Interactive tooltips beyond native `title` attribute hover
- Filtering or clicking cells to navigate to articles
- Journal entries in the heatmap
- Any content not already in `metadata.yaml` or article frontmatter
