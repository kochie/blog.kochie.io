# Journal Feed — Design Spec

*2026-05-24. Feature spec for the `/journal` daily feed section of blog.kochie.io.*

---

## 1. Summary

A short-form daily feed at `/journal` — one plain-markdown entry per day, displayed as a scrolling page grouped by month. Designed to complement the long-form articles (which take 1–2 weeks to write) with a low-friction daily writing habit. Entries carry tags, permalinks, and anchor links. Content can be authored from the terminal, via email, or via WhatsApp — any method commits to the repository and redeploys automatically on Vercel.

The feed integrates with the existing tag system, the homepage, the topbar, and the RSS feed, and feeds a Typefully draft queue for optional social posting.

---

## 2. Goals

- Provide a frictionless daily writing surface: one paragraph, one commit, live in minutes.
- Integrate cleanly with the existing Field Journal design system (tokens, typography, clay accent language).
- Share the existing tag taxonomy without polluting it — primary tags stay prominent, journal-only tags are discoverable but secondary.
- Support ingest from email and WhatsApp, including image attachments.
- Create a Typefully draft (AI-reframed, always unscheduled) for every inbound entry so social posting is opt-in without any extra effort at write-time.

## 3. Non-goals

- MDX components in journal entries. Plain markdown only — no `<Figure>`, no `<Canvas>`, no math blocks. This can be revisited later.
- Search across journal entries. Tracked separately.
- Comments or reactions.
- Multi-author journal entries.
- Automatic social posting. Typefully drafts always require a human to schedule.

---

## 4. Content Model

### 4.1. File structure

Journal entries live in a new top-level `journal/` directory, parallel to `articles/`:

```
journal/
  2026-05-24.md
  2026-05-22.md
  2026-05-19.md
  ...
```

One file per day. The filename is the entry's slug and canonical date. If a day has no entry, no file exists — there are no placeholder or empty files.

### 4.2. Frontmatter

```yaml
---
date: 2026-05-24
tags:
  - rust
  - programming
---

Rust's borrow checker finally clicked today. Ownership is a constraint that becomes a
superpower once the model is truly internal — you stop fighting the compiler and start
thinking in lifetimes.
```

**Required fields:**
- `date` — ISO 8601 date (`YYYY-MM-DD`). Must match the filename. Used as the display date and permalink slug.
- `tags` — array of strings. May be empty. Hashtag syntax is stripped from inbound messages and normalised here.

**No title field.** The date is the identity. **No author field.** There is one author.

### 4.3. TypeScript interface

Defined in `src/lib/journal-path.ts`:

```ts
export interface JournalEntry {
  slug: string           // '2026-05-24' — filename without .md
  date: string           // ISO date string
  tags: string[]
  body: string           // raw markdown
  prev: string | null    // slug of previous entry (chronologically earlier)
  next: string | null    // slug of next entry (chronologically later)
}
```

---

## 5. Routing

| URL | File | Description |
|---|---|---|
| `/journal` | `src/app/journal/page.tsx` | Full feed, grouped by month, tag chip filter |
| `/journal/[entryId]` | `src/app/journal/[entryId]/page.tsx` | Single entry permalink |
| `/journal/[entryId]/opengraph-image.tsx` | same dir | OG image for the entry |

`[entryId]` is the slug (`2026-05-24`). `generateStaticParams` reads `journal/` at build time — fully static, same pattern as `articles/[articleId]`.

### 5.1. Anchor links

Each entry on the feed page has `id={entry.slug}` on its wrapper element. The date display in the feed links to `/journal/${entry.slug}` (the permalink). This means:

- `/journal` — the full feed
- `/journal#2026-05-24` — the feed scrolled to that day (anchor link, shareable)
- `/journal/2026-05-24` — the standalone permalink page

---

## 6. Data layer

### 6.1. `src/lib/journal-path.ts`

New file. Exports:

```ts
getEntries(): Promise<JournalEntry[]>
// All entries, sorted newest-first, with prev/next filled in.

getEntryBySlug(slug: string): Promise<JournalEntry | null>
// Single entry by slug. Returns null if not found.

getRecentEntries(n: number): Promise<JournalEntry[]>
// First n entries from getEntries(). Used by the homepage strip.

getAllJournalTags(): Promise<string[]>
// Union of all tags across all entries. Used by the tag pages.

groupEntriesByMonth(entries: JournalEntry[]): MonthGroup[]
// Groups entries into { label: 'May 2026', entries: [...] }[] for the feed.
```

Plain markdown is parsed with `gray-matter` (already a dependency) for frontmatter. The body is the raw markdown string — rendered to HTML client-side on the feed page and server-side on the permalink page using a lightweight remark pipeline (no MDX, no custom plugins beyond `remark-gfm`).

### 6.2. Tag integration

`getAllJournalTags()` returns the raw tag strings from journal frontmatter. The tag pages combine this with `getUsedTags()` from `article-path.ts`. A tag is **primary** if it appears in `metadata.yaml` with a description entry; otherwise it is **secondary** (journal-only).

No changes to the existing `getUsedTags` signature or article tag behaviour.

---

## 7. Pages & components

### 7.1. New components

**`src/components/JournalEntryCard/`**
The single shared entry card used in both the feed and the homepage strip. Props:
```ts
{ entry: JournalEntry; compact?: boolean }
```
- `compact=false` (default): full body text + tag chips + clay left rule. Used in the feed and permalink page's related section.
- `compact=true`: date + first sentence truncated to ~100 chars, no tags. Used in the homepage strip.

Visual treatment: `border-left: 3px solid var(--color-accent)` with `padding-left`. Date is a monospace clay link. Tags are small outlined chips in the existing `Tag` style.

**`src/components/JournalFeed/`**
The full feed page component. Marked `'use client'` for tag filtering. Accepts all entries pre-grouped by month from the server component. Month groups render with a mono `MMMM YYYY` header. Active tag tracked in React state and reflected in the URL via `useSearchParams` as `?tag=rust`. Entries not matching the active tag are hidden (CSS `hidden` class, not unmounted — keeps anchor links functional).

Because `useSearchParams` requires a `<Suspense>` boundary in the App Router, `src/app/journal/page.tsx` wraps `<JournalFeed>` in `<Suspense fallback={<JournalFeedSkeleton />}>`. Without this, Next.js bails out the entire page to client-side rendering at build time.

**`src/components/JournalStrip/`**
The homepage widget. Server component. Accepts the 3 most recent entries. Renders:
- Section boundary: `border-left: 3px solid var(--color-accent)` on the containing block
- Mono header: `// FROM THE JOURNAL`
- 3× `<JournalEntryCard compact />` entries
- `→ all entries` link to `/journal`

**`src/components/JournalEntryPage/`**
The permalink page layout. Renders:
- Large mono date heading (links back to the anchor on the feed: `/journal#slug`)
- Body rendered from markdown to HTML
- Tag chips
- `← back to journal` link
- Prev/next bar (mirrors `ChapterPager` — previous entry on the left, next on the right)
- `// RELATED ENTRIES` section: up to 3 entries sharing at least one tag, rendered as `<JournalEntryCard compact />`. If no related entries, the section is omitted.

### 7.2. Modified pages

**`src/app/page.tsx`** — adds `<JournalStrip entries={recentEntries} />` between the Recent Essays card row and the Archive section.

**`src/app/tags/page.tsx`** — splits tag chips into two groups:
- Primary: tags defined in `metadata.yaml` with descriptions. Existing prominent grid.
- Secondary: journal-only tags (no metadata definition). New section below with a `// MORE TAGS` mono label, smaller/softer chip style.

**`src/app/tags/[tagId]/page.tsx`** — gains a second section below the articles list:
- `// JOURNAL ENTRIES` with the clay left-rule entry cards.
- If the tag has no articles, the articles section is omitted entirely (and vice versa).

**`src/components/Topbar/`** — `Journal` link added to the nav items.

---

## 8. RSS feeds

Two separate feeds. The existing feed remains articles-only. A new journal feed is added following the same static-file generation pattern.

| Feed | URL | Content |
|---|---|---|
| Articles | `/feed/rss.xml` (also `/feed/atom`, `/feed/json`) | Unchanged |
| Journal | `/journal/feed.xml` | All journal entries, newest-first. Entry title: `"Journal — 24 May 2026"`. Body: markdown rendered to plain text. |

**Generation approach:** The existing `generateFeeds` function in `src/lib/feed.ts` is a build-time script (run via `postbuild`) that writes static files to `public/feed/`. The journal feed follows the same pattern: `generateFeeds` is extended to also write `public/journal/feed.xml`. No route handler is needed — the file is served as a static asset by Vercel. The `public/journal/` directory is created by the script if it does not exist.

---

## 9. Ingest pipeline

The ingest pipeline enables publishing journal entries from email or WhatsApp without touching a terminal. It is structured as a sequence of **pluggable hooks** so new post-ingest actions (social posting, webhooks, notifications) can be added without changing the core commit logic.

### 9.1. Vercel API route

`src/app/api/journal/ingest/route.ts` — a POST endpoint protected by a shared secret (`JOURNAL_INGEST_SECRET` env var checked against an `Authorization: Bearer` header).

Accepts a normalised payload:
```ts
interface IngestPayload {
  body: string        // message text, hashtags stripped
  tags: string[]      // hashtags extracted from message
  date: string        // YYYY-MM-DD — defaults to today (UTC)
  images: IngestImage[]
}

interface IngestImage {
  url: string         // pre-signed or public URL to the image
  filename: string    // e.g. 'photo-1.jpg'
}
```

### 9.2. Input channels

**Email via Postmark inbound**
- A dedicated address (e.g. `journal@kochie.io`) is configured as a Postmark inbound stream.
- Postmark POSTs to `/api/journal/ingest/email` on every received email.
- The email adapter normalises the payload: body from the plain-text part, images from attachments (downloaded and re-uploaded to a staging URL before passing to the core pipeline).
- Subject line is ignored.

**WhatsApp via Twilio**
- A Twilio WhatsApp number is configured with a webhook pointing to `/api/journal/ingest/whatsapp`.
- The WhatsApp adapter normalises the payload: body from `Body`, images from `MediaUrl0` / `MediaUrl1` etc.
- Twilio media URLs are short-lived; the adapter downloads them immediately and passes the binary to the pipeline.

Both channel adapters call the same core ingest handler after normalisation.

### 9.3. Tag syntax

Hashtags at the end of a message are treated as tags and stripped from the body:

```
Rust's borrow checker finally clicked. Ownership becomes a superpower. #rust #programming
```

Produces `body: "Rust's borrow checker finally clicked. Ownership becomes a superpower."` and `tags: ["rust", "programming"]`.

Hashtags mid-sentence are left in the body unchanged. "Trailing" means: a contiguous run of `#word` tokens at the end of the message, after all non-hashtag content. Examples:

| Input | body | tags |
|---|---|---|
| `Great day. #melbourne #cycling` | `"Great day."` | `["melbourne", "cycling"]` |
| `Thinking about #rust today` | `"Thinking about #rust today"` | `[]` |
| `#rust is great` | `"#rust is great"` | `[]` |
| `Love this. #rust #programming #tools` | `"Love this."` | `["rust", "programming", "tools"]` |

### 9.4. Hook sequence

The core handler executes hooks in order. A hook failure does not block subsequent hooks — each is attempted independently, and errors are logged to Sentry:

1. **GitHub commit hook** — creates `journal/YYYY-MM-DD.md` and any image files at `public/images/journal/YYYY-MM-DD/` via the GitHub Contents API. Uses a `GITHUB_TOKEN` env var with write access to the repo. Vercel detects the push and triggers a redeployment automatically.

2. **Typefully draft hook** — calls the Typefully API to create an unscheduled draft. The draft content is an AI-reframed, tweet-optimised version of the entry body — shorter, punchier, different angle, not a verbatim copy. Always created as unscheduled; nothing posts without a human action in Typefully. Uses `TYPEFULLY_API_KEY` env var. If the entry body is too short to meaningfully reframe, the draft is created with the original body.

### 9.5. Environment variables

| Variable | Purpose |
|---|---|
| `JOURNAL_INGEST_SECRET` | Shared secret for the ingest endpoint |
| `GITHUB_TOKEN` | GitHub PAT with `contents:write` on the repo |
| `POSTMARK_INBOUND_TOKEN` | Validates Postmark webhook authenticity |
| `TWILIO_AUTH_TOKEN` | Validates Twilio webhook signatures |
| `TYPEFULLY_API_KEY` | Typefully API key for draft creation |
| *(no extra key needed)* | Tweet reframe uses the Vercel AI Gateway (`"anthropic/claude-haiku-3-5"` string via `@ai-sdk/gateway`). Credentials are managed by the Vercel platform — no additional API key env var required. |

### 9.6. Image storage

Images are committed directly to the repository at `public/images/journal/YYYY-MM-DD/`. Multiple images per entry are named `photo-1.jpg`, `photo-2.jpg` etc. in the order received.

**LQIP:** Journal entries are rendered via a plain remark pipeline (not MDX), so the existing `rehype-lqip-plugin` — which is wired into the MDX compilation path and hardcoded to `public/images/articles/` — does not run for journal images. Journal images are served as standard `<img>` tags with no LQIP blur-up treatment in v1. Adding LQIP for journal images is a future enhancement, not in scope here.

---

## 10. Tooling

**`bin/new-journal.ts`**
CLI script for local authoring. Invoked via `npm run new:journal`. Creates `journal/YYYY-MM-DD.md` with the frontmatter stub for today's date and opens it in the default editor. If a file for today already exists, it warns and exits rather than overwriting.

Added to `package.json` scripts:
```json
"new-journal:build": "esbuild --bundle --format=esm --packages=external --platform=node --target=node20 --outdir=bin/dist bin/new-journal.ts",
"new:journal": "npm run new-journal:build && node bin/dist/new-journal.js"
```

---

## 11. Sitemap & OG

**Sitemap** (`src/app/sitemap.ts`) — journal entry slugs added alongside article slugs. `/journal` itself is also included.

**OG image** (`src/app/journal/[entryId]/opengraph-image.tsx`) — renders the date in large mono type and the first ~120 characters of the body. Uses the existing `og-fonts.ts` font loading and `og-template.tsx` base. Background: Field Journal `bg-deep` dark token.

---

## 12. File change summary

**New files:**
- `journal/` directory (content, not source)
- `src/lib/journal-path.ts`
- `src/app/journal/page.tsx`
- `src/app/journal/[entryId]/page.tsx`
- `src/app/journal/[entryId]/opengraph-image.tsx`
- `src/app/api/journal/ingest/route.ts` — core ingest handler (hook sequencer)
- `src/app/api/journal/ingest/email/route.ts` — Postmark adapter
- `src/app/api/journal/ingest/whatsapp/route.ts` — Twilio adapter
- `src/components/JournalEntryCard/index.tsx`
- `src/components/JournalFeed/index.tsx`
- `src/components/JournalStrip/index.tsx`
- `src/components/JournalEntryPage/index.tsx`
- `bin/new-journal.ts`

**Modified files:**
- `src/app/page.tsx` — add `JournalStrip`
- `src/app/tags/page.tsx` — primary/secondary tag split
- `src/app/tags/[tagId]/page.tsx` — Journal Entries section
- `src/components/Topbar/` — Journal nav link
- `src/lib/feed.ts` — second RSS feed for journal
- `src/app/sitemap.ts` — journal slugs
- `package.json` — `new:journal` scripts
- `src/components/index.ts` — export new components

**Unchanged by this spec:**
- All existing article files and components
- The Field Journal design token system (Phase 1–7 work)
- `src/lib/article-path.ts` (additive only — no changes to existing exports)
