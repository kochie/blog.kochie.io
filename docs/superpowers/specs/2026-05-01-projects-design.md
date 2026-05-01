# Projects · Design

**Date:** 2026-05-01
**Status:** Approved, ready for implementation plan

## Overview

A *project* is a sequence of related articles that tell a longer story over time. Each chapter is short (2–5 minute reads) but the project as a whole is a sustained body of work — like a book where each post is a chapter rather than a standalone essay.

Projects are a new top-level content concept alongside articles and tags. They do not replace tags. Tags are *categorical* ("what topic is this about?"); projects are *narrative* ("what story does this belong to?"). An article can carry many tags but at most one project.

## Decisions made during brainstorming

| # | Question | Decision |
|---|---|---|
| 1 | Conceptual model | Projects are narrative + ordered. Article has at most one project. Tags are categorical and orthogonal. |
| 2 | Storage shape | Hybrid — manifest YAML at `projects/<slug>.yaml` carries metadata; articles declare membership via `project:` in frontmatter. |
| 3 | Feed behaviour | Mixed. Project chapters appear in the main archive and RSS feed alongside long-form essays, with a small project badge. |
| 4 | Project page layout | Two-column. Hero/title/deck/meta on the left, numbered chapter timeline on the right. |
| 5 | Article-page changes | Kicker line gets a project segment. Clay-bordered banner sits between meta line and body. Foot gets a chapter pager replacing the similar-essays rail. |
| 6 | Nav placement & legacy tags | Topbar grows a `Projects` link between `Archive` and `Tags`. Legacy `Projects` and `Foundry` tags retire (both currently unused). |
| 7 | Pager vs similar-essays | Chapter pager replaces similar-essays for project articles. On chapter 1 / last chapter, the unavailable side becomes a `VIEW PROJECT →` card. |

## Data model

### Project manifest — `projects/<slug>.yaml`

```yaml
title: The Foundry
blurb: Building a backyard metal foundry from cement, sand, and stubbornness.
hero:
  src: foundry-hero.jpg
  alt: A glowing crucible mid-pour
status: ongoing               # ongoing | completed | paused
startedDate: 2025-04-01T00:00:00+10:00

# Optional. When present, overrides the publishedDate ordering.
order:
  - 14-pouring-the-shell
  - 15-burner
  - 16-crucible-explosion
  - 17-aluminium-pour
```

The hero image lives in `projects/<slug>/hero.jpg`, copied to `public/images/projects/<slug>/` at build time. LQIP generated the same way as article jumbotrons.

### Article frontmatter additions

Two optional fields on each article:

```yaml
project: foundry              # matches a projects/<slug>.yaml slug
chapter: 4                    # optional; pins this chapter's number
```

`chapter` is optional. When absent, the chapter number derives from the article's position in the `publishedDate`-sorted list of project members, or from the manifest's `order:` list when one exists. When present, it pins this article's chapter number.

### Membership and ordering rules

These are distinct concerns and should be reasoned about separately.

**Membership** is determined *only* by the article's frontmatter. An article belongs to a project iff its `project:` field equals that project's slug. The manifest does not control membership — listing an article in `order:` does not grant it project membership, and omitting it does not strip it.

**Ordering** is determined by, in priority order:

1. **Explicit `chapter:` in article frontmatter** — pins that article to that chapter number.
2. **Position in manifest `order:` list** — if `order:` is present, articles whose `articleDir` appears in the list take the positions implied by the list. Articles that are project members but *not* listed in `order:` are appended after the listed ones in `publishedDate` ascending order.
3. **`publishedDate` ascending** — fallback for everything else.

**Concrete chapter-number assignment algorithm** (run inside `buildProject`):

1. Collect all project members from frontmatter (the membership step above).
2. Apply explicit `chapter:` pins. Validate: numbers are positive integers, no duplicates within the project, and the maximum pinned number does not exceed the member count.
3. Walk the remaining (unpinned) members in the order implied by `order:` then `publishedDate`. Assign them the smallest unused chapter numbers in `[1, N]` where `N` is the total member count.
4. Final ordering for display = members sorted ascending by their assigned chapter number.

This guarantees chapter numbers form the dense range `1..N`. No gaps. Sparse explicit chapter numbers (e.g., `chapter: 5` on a 3-member project) fail validation rather than producing visual gaps.

### TypeScript types — `types/metadata.d.ts`

```ts
export type ProjectStatus = 'ongoing' | 'completed' | 'paused'

export interface ProjectManifest {
  slug: string                                 // derived from filename
  title: string
  blurb: string
  hero: { src: string; alt: string; lqip?: string }
  status: ProjectStatus
  startedDate: string
  order?: string[]                             // optional articleDir override
}

export interface ProjectMember {
  article: ArticleMetadata
  chapter: number
}

export interface Project extends ProjectManifest {
  members: ProjectMember[]                      // ordered, chapter-numbered
}

export interface ProjectContext {
  project: Project
  chapter: number
  prev: ProjectMember | null
  next: ProjectMember | null
}
```

`ArticleMetadata` gains two optional fields:

```ts
export interface ArticleMetadata {
  // … existing fields …
  project?: string                             // slug of a projects/<slug>.yaml
  chapter?: number                             // optional explicit pin
}
```

## Routes

| Path | Page | Source |
|---|---|---|
| `/projects` | Index of all projects, card grid | `projects/*.yaml` |
| `/projects/[slug]` | Hub: hero/title/deck/meta + numbered timeline | manifest + member articles |
| `/articles/[articleId]` | (Existing) Article page, with project chrome added when applicable | unchanged |

`generateStaticParams` for `/projects/[slug]` enumerates `projects/*.yaml`. Article URLs do not change for project members — `/articles/14-aluminium-pour` is the canonical address whether the article is in a project or not. Inbound links and RSS GUIDs remain stable.

## Sitemap, RSS, and feeds

- `src/app/sitemap.ts` adds `/projects` and one entry per `/projects/<slug>`. `lastModified` for a project page = the most recent `editedDate` among its member articles, falling back to `startedDate` from the manifest.
- `src/lib/feed.ts` is unchanged. Project articles are already iterated as articles; they appear in the main RSS feed alongside long-form essays.
- Per-project RSS feeds (`/feed/projects/<slug>.rss`) are out of scope for v1. Can be added as a follow-up if subscribers ask.

## Components

### New components

| Component | Path | Purpose |
|---|---|---|
| `ProjectsIndex` | `src/app/projects/page.tsx` | Server page rendering the project cards grid. |
| `ProjectPage` | `src/app/projects/[slug]/page.tsx` | The two-column hub. |
| `ProjectCard` | `src/components/ProjectCard/index.tsx` | Card on `/projects` — status pill, title, blurb, chapter count. |
| `ChapterTimeline` | `src/components/ChapterTimeline/index.tsx` | Right-column numbered timeline with done/current/upcoming markers. |
| `ProjectKicker` | `src/components/ProjectKicker/index.tsx` | Inline kicker segment for the article page. Renders `// FOUNDRY · CH.04` next to the article number. |
| `ProjectBanner` | `src/components/ProjectBanner/index.tsx` | Clay-bordered banner between meta line and body on project articles. Links to the project hub. |
| `ChapterPager` | `src/components/ChapterPager/index.tsx` | Foot prev/next pair for project articles. Wraps to a `VIEW PROJECT →` card on the unavailable side for chapter 1 / last chapter. |

### Modified components

- **`Article/index.tsx` / `Kicker`**: kicker becomes project-aware. When `article.project` is set, renders `// 14 · FOUNDRY · CH.04 · TAGS`. New slot below `MetaLine` and above the optional hero figure for `<ProjectBanner>`.
- **`app/articles/[articleId]/page.tsx`**: composition swaps `<SimilarArticles>` for `<ChapterPager>` when the article belongs to a project. The Author card stays put either way.
- **`Topbar/index.tsx`**: adds a `Projects` link between `Archive` and `Tags`.
- **`metadata.yaml`**: removes the `Projects` and `Foundry` tag entries.

### New library — `src/lib/project-path.ts`

| Function | Purpose |
|---|---|
| `getProjectManifest(slug)` | Read `projects/<slug>.yaml`, return the typed manifest. Throws on parse error or invalid `status`. |
| `getAllProjectManifests()` | Discover and parse every `projects/*.yaml`. |
| `buildProject(slug, allArticles)` | Compose the manifest + ordered member articles + computed chapter numbers. The single source of truth for the full project view. |
| `getProjectContext(article, allArticles)` | Given an article, return `{ project, chapter, prev, next }` or `null` if the article isn't in a project. Consumed by `ProjectKicker`, `ProjectBanner`, and `ChapterPager`. |

The single `getProjectContext` keeps the article page's data flow flat — one async call, one struct passed down to the chrome components.

## Validation & edge cases

### Hard-fail at build time

| Condition | When checked |
|---|---|
| Article declares `project: foo` but `projects/foo.yaml` doesn't exist | `getProjectContext` |
| Manifest's `order:` list references an article slug that doesn't exist | `buildProject` |
| Two articles in the same project have the same explicit `chapter:` number | `buildProject` |
| `chapter:` is not a positive integer | `buildProject` |
| Explicit `chapter:` exceeds the project's total member count (would produce a gap) | `buildProject` |
| Manifest's `status` is not in `ongoing` / `completed` / `paused` | `getProjectManifest` (whitelist) |

### Soft-handled

| Condition | Behaviour |
|---|---|
| Manifest exists, no member articles yet | Project page renders. Timeline shows "No chapters published yet." Index card shows "0 chapters · planned." |
| No `order:` and no explicit `chapter:` anywhere | Order falls out of `publishedDate` ascending. Chapter numbers are 1, 2, 3… in that order. |
| Mixed explicit + implicit chapter numbers in one project | Explicit numbers are honoured. Implicit numbers fill the remaining slots in `publishedDate` order, skipping any taken by explicit values. |
| `prev`/`next` on a single-chapter project | Both slots wrap to `VIEW PROJECT →`. |
| Project article's `publishedDate` is in the future | Article is already filtered by the existing date guard in `getAllArticlesMetadata()`. It also disappears from the project's chapter list and timeline until its date arrives. |

### Behaviour rules

- `prev`/`next` use the project's chapter ordering, not the global archive ordering. Pager on chapter 4 points to chapters 3 and 5, regardless of intervening publications.
- `editedDate` does not affect chapter ordering. Only `publishedDate` (or manifest `order:`) drives sequence.
- A project with all members in `paused` / future state still appears on `/projects`. Status drives presentation, not visibility.
- Tags on a project article are still rendered. Being in a project doesn't suppress topical categorisation.

## Testing

Tests fall into three layers:

### Pure logic — `src/lib/project-path.ts`

Unit tests on `buildProject` and `getProjectContext` covering:

- No project members → empty `members` array, `getProjectContext` returns `null` for any article.
- Single member → chapter 1, `prev`/`next` both wrap to "view project" sentinels.
- Multiple members, all implicit ordering → chapters numbered by `publishedDate` ascending.
- Multiple members, manifest `order:` set → manifest order wins over `publishedDate`.
- Mixed implicit + explicit chapter pinning → explicit numbers honoured, implicit fills the remaining slots in `1..N` deterministically.
- Duplicate explicit chapter numbers → throws with a clear error.
- Explicit chapter number exceeds member count → throws (no visual gaps).
- Article references a nonexistent project slug → throws.
- Article is in `order:` of the manifest but its frontmatter does not declare `project:` → article is *not* a member (membership is frontmatter-driven; `order:` only sequences). Test verifies this.
- `order:` references a nonexistent article slug → throws.
- Future-dated articles are excluded from `members`.
- `prev`/`next` resolution: middle chapter, first chapter, last chapter, single-chapter project.

Same posture as `bleed-jump.test.ts` — pure functions, synthetic fixtures, no DOM.

### Component-level

- `ProjectCard` renders status pill, title, blurb, chapter count for each `status` value.
- `ChapterTimeline` renders done/current/upcoming markers correctly given a member list and a current chapter index.
- `ProjectBanner` links to the right project URL and shows correct chapter info.
- `ChapterPager` renders previous/next cards on internal chapters; renders `VIEW PROJECT →` on the appropriate side for chapter 1 and last chapter.
- `ProjectKicker` renders the project segment alongside the article number.
- `Article` integration: when `project` is set, kicker is project-aware, banner appears, similar-essays is replaced by chapter pager. When no project, page renders identically to today.

### Build-time / page-level

- `/projects` route generates one card per manifest.
- `/projects/[slug]` `generateStaticParams` enumerates manifests.
- Sitemap includes `/projects` and one entry per project page with the right `lastModified`.

## Out of scope for v1

- Per-project RSS feeds (`/feed/projects/<slug>.rss`).
- Project authors distinct from article authors. Projects inherit authorship via member articles.
- Cross-project relationships ("see also: this other project"). Tags handle the loose end here.
- Migration of existing articles into a Foundry project. The Foundry project will be authored fresh from chapter 1 onwards once the system ships — there are no existing Foundry-tagged articles to migrate.
- Image asset cleanup for the unused `Projects` and `Foundry` tag images in `public/images/tags/`. Leaving them is harmless; can be cleaned up later.
