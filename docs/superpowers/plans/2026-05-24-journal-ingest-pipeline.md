# Journal Feed — Ingest Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the server-side ingest pipeline that lets journal entries be published from email (Postmark) or WhatsApp (Twilio), committing content to GitHub and creating an unscheduled Typefully draft for every inbound entry.

**Architecture:** A hook-based pipeline: normalised payloads flow through a shared core handler that runs independent hooks in sequence (GitHub commit → Typefully draft). Each inbound channel (email, WhatsApp) has its own adapter route that normalises the channel-specific payload and calls the core handler. Auth is checked at the perimeter of each route — the core handler never re-validates. Hook failures are logged to Sentry but do not block subsequent hooks.

**Tech Stack:** Next.js 16 App Router Route Handlers · Vercel AI Gateway (`@ai-sdk/vercel`) · GitHub Contents API (fetch, no SDK) · Typefully API (fetch) · Postmark inbound · Twilio webhooks · Vitest + msw (already installed) · `crypto` (built-in, for Twilio HMAC validation).

**Reference:** Design spec at `docs/superpowers/specs/2026-05-24-journal-feed-design.md` §9.

---

## File Structure

**New files:**
- `src/lib/journal-ingest.ts` — shared types and tag-extraction utility
- `src/lib/__tests__/journal-ingest.test.ts` — unit tests for tag extraction
- `src/lib/journal-hooks.ts` — GitHub commit hook + Typefully draft hook
- `src/lib/__tests__/journal-hooks.test.ts` — unit tests for hooks (msw)
- `src/app/api/journal/ingest/route.ts` — core POST handler (hook sequencer)
- `src/app/api/journal/ingest/__tests__/ingest.test.ts`
- `src/app/api/journal/ingest/email/route.ts` — Postmark adapter
- `src/app/api/journal/ingest/email/__tests__/email.test.ts`
- `src/app/api/journal/ingest/whatsapp/route.ts` — Twilio adapter
- `src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts`

**No existing files are modified** by this plan. The ingest pipeline is entirely additive.

---

## Task 1: Shared Types + Tag Extraction Utility

**Files:**
- Create: `src/lib/journal-ingest.ts`
- Create: `src/lib/__tests__/journal-ingest.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/__tests__/journal-ingest.test.ts
import { describe, expect, test } from 'vitest'
import { extractTags } from '../journal-ingest'

describe('extractTags', () => {
  test('extracts trailing hashtags and strips them from body', () => {
    const { body, tags } = extractTags('Great day. #melbourne #cycling')
    expect(body).toBe('Great day.')
    expect(tags).toEqual(['melbourne', 'cycling'])
  })

  test('leaves mid-sentence hashtags in body untouched', () => {
    const { body, tags } = extractTags('Thinking about #rust today')
    expect(body).toBe('Thinking about #rust today')
    expect(tags).toEqual([])
  })

  test('does not treat a leading-only hashtag as trailing', () => {
    const { body, tags } = extractTags('#rust is great')
    expect(body).toBe('#rust is great')
    expect(tags).toEqual([])
  })

  test('extracts trailing run of multiple hashtags', () => {
    const { body, tags } = extractTags('Love this. #rust #programming #tools')
    expect(body).toBe('Love this.')
    expect(tags).toEqual(['rust', 'programming', 'tools'])
  })

  test('handles message that is only hashtags (no body text)', () => {
    const { body, tags } = extractTags('#rust #programming')
    expect(body).toBe('')
    expect(tags).toEqual(['rust', 'programming'])
  })

  test('trims leading/trailing whitespace from body', () => {
    const { body, tags } = extractTags('  Hello world.  #test  ')
    expect(body).toBe('Hello world.')
    expect(tags).toEqual(['test'])
  })

  test('normalises tags to lowercase', () => {
    const { body, tags } = extractTags('Note #Rust #Programming')
    expect(body).toBe('Note')
    expect(tags).toEqual(['rust', 'programming'])
  })

  test('handles empty string input', () => {
    const { body, tags } = extractTags('')
    expect(body).toBe('')
    expect(tags).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/lib/__tests__/journal-ingest.test.ts
```

Expected: FAIL with "Cannot find module '../journal-ingest'"

- [ ] **Step 3: Implement `src/lib/journal-ingest.ts`**

```ts
// src/lib/journal-ingest.ts

export interface IngestImage {
  /** Pre-signed or publicly accessible URL to the image. */
  url: string
  /** Suggested filename, e.g. 'photo-1.jpg'. */
  filename: string
}

export interface IngestPayload {
  /** Message text with trailing hashtags already stripped. */
  body: string
  /** Hashtags extracted from the message, normalised to lowercase. */
  tags: string[]
  /** ISO date string 'YYYY-MM-DD'. Defaults to today UTC. */
  date: string
  images: IngestImage[]
}

export interface TagExtractionResult {
  body: string
  tags: string[]
}

/**
 * Splits trailing hashtags from a message body.
 *
 * "Trailing" means a contiguous run of `#word` tokens at the very end of the
 * message (after all non-hashtag content). Mid-sentence hashtags are left in
 * the body unchanged.
 */
export function extractTags(raw: string): TagExtractionResult {
  const trimmed = raw.trim()
  if (!trimmed) return { body: '', tags: [] }

  // Split on whitespace, walk backwards collecting #word tokens.
  const tokens = trimmed.split(/\s+/)
  const hashtagPattern = /^#([a-zA-Z]\w*)$/

  const tags: string[] = []
  let trailingCount = 0

  for (let i = tokens.length - 1; i >= 0; i--) {
    const match = hashtagPattern.exec(tokens[i])
    if (match) {
      tags.unshift(match[1].toLowerCase())
      trailingCount++
    } else {
      break
    }
  }

  // If ALL tokens are hashtags there is no body.
  const bodyTokens = tokens.slice(0, tokens.length - trailingCount)
  const body = bodyTokens.join(' ').trim()

  return { body, tags }
}

/** Returns today's date as 'YYYY-MM-DD' in UTC. */
export function todaySlug(): string {
  return new Date().toISOString().slice(0, 10)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/lib/__tests__/journal-ingest.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/journal-ingest.ts src/lib/__tests__/journal-ingest.test.ts
git commit -m "feat(journal): shared IngestPayload types and extractTags utility"
```

---

## Task 2: GitHub Commit Hook

**Files:**
- Modify: `src/lib/journal-hooks.ts` (create)
- Create: `src/lib/__tests__/journal-hooks.test.ts`

The GitHub Contents API endpoint used:
`PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}`

Required env vars: `GITHUB_TOKEN`, `GITHUB_OWNER` (e.g. `kochie`), `GITHUB_REPO` (e.g. `blog.kochie.io`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/__tests__/journal-hooks.test.ts
import * as Sentry from '@sentry/nextjs'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import type { IngestPayload } from '../journal-ingest'
import { githubCommitHook } from '../journal-hooks'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const server = setupServer()

const GITHUB_API = 'https://api.github.com/repos/kochie/blog.kochie.io/contents'

const basePayload: IngestPayload = {
  body: 'Rust clicked today.',
  tags: ['rust'],
  date: '2026-05-24',
  images: [],
}

describe('githubCommitHook', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })
  afterAll(() => server.close())

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'ghp_test'
    process.env.GITHUB_OWNER = 'kochie'
    process.env.GITHUB_REPO = 'blog.kochie.io'
  })

  test('creates the journal markdown file via GitHub Contents API', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        expect(request.headers.get('authorization')).toBe('Bearer ghp_test')
        return HttpResponse.json({ content: { name: '2026-05-24.md' } }, { status: 201 })
      })
    )

    await githubCommitHook(basePayload)

    expect(capturedBody).not.toBeNull()
    // The content field is base64-encoded frontmatter + body.
    const decoded = Buffer.from(capturedBody!.content as string, 'base64').toString('utf8')
    expect(decoded).toContain('date: 2026-05-24')
    expect(decoded).toContain('tags:')
    expect(decoded).toContain('- rust')
    expect(decoded).toContain('Rust clicked today.')
    expect(capturedBody!.message).toBe('journal: 2026-05-24')
  })

  test('commits image files when images are present', async () => {
    const calls: string[] = []

    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async () => {
        calls.push('md')
        return HttpResponse.json({ content: { name: '2026-05-24.md' } }, { status: 201 })
      }),
      http.put(`${GITHUB_API}/public/images/journal/2026-05-24/photo-1.jpg`, async ({ request }) => {
        calls.push('img')
        const body = (await request.json()) as Record<string, unknown>
        expect(body.message).toBe('journal: 2026-05-24 (images)')
        return HttpResponse.json({ content: { name: 'photo-1.jpg' } }, { status: 201 })
      })
    )

    // Fetch the image URL — the hook downloads it and encodes to base64.
    server.use(
      http.get('https://example.com/photo.jpg', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(4), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      )
    )

    await githubCommitHook({
      ...basePayload,
      images: [{ url: 'https://example.com/photo.jpg', filename: 'photo-1.jpg' }],
    })

    expect(calls).toContain('md')
    expect(calls).toContain('img')
  })

  test('throws when GITHUB_TOKEN is missing', async () => {
    delete process.env.GITHUB_TOKEN
    await expect(githubCommitHook(basePayload)).rejects.toThrow('GITHUB_TOKEN')
  })

  test('throws when GitHub API returns a non-2xx status', async () => {
    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json({ message: 'Unprocessable Entity' }, { status: 422 })
      )
    )
    await expect(githubCommitHook(basePayload)).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/lib/__tests__/journal-hooks.test.ts
```

Expected: FAIL with "Cannot find module '../journal-hooks'"

- [ ] **Step 3: Implement `githubCommitHook` in `src/lib/journal-hooks.ts`**

```ts
// src/lib/journal-hooks.ts
import * as Sentry from '@sentry/nextjs'
import type { IngestPayload } from './journal-ingest'

// ─── GitHub commit hook ────────────────────────────────────────────────────

function buildMarkdown(payload: IngestPayload): string {
  const tagsYaml =
    payload.tags.length > 0
      ? `tags:\n${payload.tags.map((t) => `  - ${t}`).join('\n')}`
      : 'tags: []'

  return `---\ndate: ${payload.date}\n${tagsYaml}\n---\n\n${payload.body}\n`
}

async function githubPut(
  path: string,
  content: string,
  message: string,
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ message, content }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API error ${res.status}: ${text}`)
  }
}

export async function githubCommitHook(payload: IngestPayload): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token) throw new Error('GITHUB_TOKEN env var is required')
  if (!owner) throw new Error('GITHUB_OWNER env var is required')
  if (!repo) throw new Error('GITHUB_REPO env var is required')

  // 1. Commit the markdown file.
  const markdown = buildMarkdown(payload)
  const mdContent = Buffer.from(markdown, 'utf8').toString('base64')
  await githubPut(
    `journal/${payload.date}.md`,
    mdContent,
    `journal: ${payload.date}`,
    token,
    owner,
    repo
  )

  // 2. Commit each image (download → base64 encode → PUT).
  for (const image of payload.images) {
    const imgRes = await fetch(image.url)
    if (!imgRes.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch image ${image.url}: ${imgRes.status}`)
      )
      continue
    }
    const arrayBuffer = await imgRes.arrayBuffer()
    const imgContent = Buffer.from(arrayBuffer).toString('base64')
    await githubPut(
      `public/images/journal/${payload.date}/${image.filename}`,
      imgContent,
      `journal: ${payload.date} (images)`,
      token,
      owner,
      repo
    )
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/lib/__tests__/journal-hooks.test.ts --reporter=verbose
```

Expected: All 4 GitHub hook tests PASS.

---

## Task 3: Typefully Draft Hook

**Files:**
- Modify: `src/lib/journal-hooks.ts` (add `typefullyDraftHook`)
- Modify: `src/lib/__tests__/journal-hooks.test.ts` (add tests)

The Typefully API endpoint:
`POST https://api.typefully.com/v1/drafts/`
Header: `X-API-KEY: Bearer <key>`
Body: `{ "content": "...", "threadify": false, "schedule-date": null }`

The AI reframe uses Vercel AI Gateway via `generateText` from `ai` package with model `"anthropic/claude-haiku-3-5"`.

- [ ] **Step 1: Install the `ai` package if not present**

```bash
pnpm list ai 2>/dev/null | grep -q 'ai ' || pnpm add ai
```

- [ ] **Step 2: Add Typefully tests to the test file**

Append to `src/lib/__tests__/journal-hooks.test.ts`:

```ts
// Add these imports at the top of the existing test file:
// import { typefullyDraftHook } from '../journal-hooks'
// import { generateText } from 'ai'
// vi.mock('ai', () => ({ generateText: vi.fn() }))

// Then add this describe block:

describe('typefullyDraftHook', () => {
  // Import at top level after vi.mock calls:
  // let typefullyDraftHook: typeof import('../journal-hooks').typefullyDraftHook

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })
  afterAll(() => server.close())

  beforeEach(() => {
    process.env.TYPEFULLY_API_KEY = 'tf_test_key'
  })

  test('creates an unscheduled Typefully draft with AI-reframed content', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.post('https://api.typefully.com/v1/drafts/', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        expect(request.headers.get('x-api-key')).toBe('Bearer tf_test_key')
        return HttpResponse.json({ id: 'draft_1' }, { status: 200 })
      })
    )

    await typefullyDraftHook(basePayload, 'AI-reframed punchier version')

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.content).toBe('AI-reframed punchier version')
    expect(capturedBody!['schedule-date']).toBeNull()
    expect(capturedBody!.threadify).toBe(false)
  })

  test('throws when TYPEFULLY_API_KEY is missing', async () => {
    delete process.env.TYPEFULLY_API_KEY
    await expect(
      typefullyDraftHook(basePayload, 'content')
    ).rejects.toThrow('TYPEFULLY_API_KEY')
  })

  test('throws when Typefully API returns non-2xx', async () => {
    server.use(
      http.post('https://api.typefully.com/v1/drafts/', () =>
        HttpResponse.json({ error: 'invalid key' }, { status: 401 })
      )
    )
    await expect(
      typefullyDraftHook(basePayload, 'content')
    ).rejects.toThrow()
  })
})
```

Rewrite the full test file so both describe blocks and all imports are coherent:

```ts
// src/lib/__tests__/journal-hooks.test.ts
import * as Sentry from '@sentry/nextjs'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import type { IngestPayload } from '../journal-ingest'
import { githubCommitHook, typefullyDraftHook } from '../journal-hooks'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const server = setupServer()

const GITHUB_API = 'https://api.github.com/repos/kochie/blog.kochie.io/contents'

const basePayload: IngestPayload = {
  body: 'Rust clicked today.',
  tags: ['rust'],
  date: '2026-05-24',
  images: [],
}

describe('githubCommitHook', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })
  afterAll(() => server.close())

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'ghp_test'
    process.env.GITHUB_OWNER = 'kochie'
    process.env.GITHUB_REPO = 'blog.kochie.io'
  })

  test('creates the journal markdown file via GitHub Contents API', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        expect(request.headers.get('authorization')).toBe('Bearer ghp_test')
        return HttpResponse.json({ content: { name: '2026-05-24.md' } }, { status: 201 })
      })
    )

    await githubCommitHook(basePayload)

    expect(capturedBody).not.toBeNull()
    const decoded = Buffer.from(capturedBody!.content as string, 'base64').toString('utf8')
    expect(decoded).toContain('date: 2026-05-24')
    expect(decoded).toContain('tags:')
    expect(decoded).toContain('- rust')
    expect(decoded).toContain('Rust clicked today.')
    expect(capturedBody!.message).toBe('journal: 2026-05-24')
  })

  test('commits image files when images are present', async () => {
    const calls: string[] = []

    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async () => {
        calls.push('md')
        return HttpResponse.json({ content: { name: '2026-05-24.md' } }, { status: 201 })
      }),
      http.put(
        `${GITHUB_API}/public/images/journal/2026-05-24/photo-1.jpg`,
        async ({ request }) => {
          calls.push('img')
          const body = (await request.json()) as Record<string, unknown>
          expect(body.message).toBe('journal: 2026-05-24 (images)')
          return HttpResponse.json({ content: { name: 'photo-1.jpg' } }, { status: 201 })
        }
      ),
      http.get('https://example.com/photo.jpg', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(4), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      )
    )

    await githubCommitHook({
      ...basePayload,
      images: [{ url: 'https://example.com/photo.jpg', filename: 'photo-1.jpg' }],
    })

    expect(calls).toContain('md')
    expect(calls).toContain('img')
  })

  test('throws when GITHUB_TOKEN is missing', async () => {
    delete process.env.GITHUB_TOKEN
    await expect(githubCommitHook(basePayload)).rejects.toThrow('GITHUB_TOKEN')
  })

  test('throws when GitHub API returns a non-2xx status', async () => {
    server.use(
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json({ message: 'Unprocessable Entity' }, { status: 422 })
      )
    )
    await expect(githubCommitHook(basePayload)).rejects.toThrow()
  })
})

describe('typefullyDraftHook', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })
  afterAll(() => server.close())

  beforeEach(() => {
    process.env.TYPEFULLY_API_KEY = 'tf_test_key'
  })

  test('creates an unscheduled Typefully draft with the given content', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.post('https://api.typefully.com/v1/drafts/', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        expect(request.headers.get('x-api-key')).toBe('Bearer tf_test_key')
        return HttpResponse.json({ id: 'draft_1' }, { status: 200 })
      })
    )

    await typefullyDraftHook(basePayload, 'AI-reframed punchier version')

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.content).toBe('AI-reframed punchier version')
    expect(capturedBody!['schedule-date']).toBeNull()
    expect(capturedBody!.threadify).toBe(false)
  })

  test('throws when TYPEFULLY_API_KEY is missing', async () => {
    delete process.env.TYPEFULLY_API_KEY
    await expect(typefullyDraftHook(basePayload, 'content')).rejects.toThrow(
      'TYPEFULLY_API_KEY'
    )
  })

  test('throws when Typefully API returns non-2xx', async () => {
    server.use(
      http.post('https://api.typefully.com/v1/drafts/', () =>
        HttpResponse.json({ error: 'invalid key' }, { status: 401 })
      )
    )
    await expect(typefullyDraftHook(basePayload, 'content')).rejects.toThrow()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm vitest run src/lib/__tests__/journal-hooks.test.ts
```

Expected: The 3 new Typefully tests FAIL with "typefullyDraftHook is not a function".

- [ ] **Step 4: Implement `typefullyDraftHook` — append to `src/lib/journal-hooks.ts`**

```ts
// Append to src/lib/journal-hooks.ts

// ─── Typefully draft hook ──────────────────────────────────────────────────

export async function typefullyDraftHook(
  payload: IngestPayload,
  draftContent: string
): Promise<void> {
  const apiKey = process.env.TYPEFULLY_API_KEY
  if (!apiKey) throw new Error('TYPEFULLY_API_KEY env var is required')

  const res = await fetch('https://api.typefully.com/v1/drafts/', {
    method: 'POST',
    headers: {
      'X-API-KEY': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: draftContent,
      threadify: false,
      'schedule-date': null,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Typefully API error ${res.status}: ${text}`)
  }
}
```

- [ ] **Step 5: Run all hook tests to verify they pass**

```bash
pnpm vitest run src/lib/__tests__/journal-hooks.test.ts --reporter=verbose
```

Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/journal-hooks.ts src/lib/__tests__/journal-hooks.test.ts
git commit -m "feat(journal): GitHub commit hook and Typefully draft hook"
```

---

## Task 4: Core Ingest Handler

**Files:**
- Create: `src/app/api/journal/ingest/route.ts`
- Create: `src/app/api/journal/ingest/__tests__/ingest.test.ts`

The core handler:
1. Validates `Authorization: Bearer <JOURNAL_INGEST_SECRET>`.
2. Parses and validates the `IngestPayload` body.
3. Calls an AI reframe via `generateText` from the `ai` package using the Vercel AI Gateway model string `"anthropic/claude-haiku-3-5"`.
4. Runs hooks independently: `githubCommitHook` then `typefullyDraftHook`. A hook error is captured to Sentry but does not block the next hook.
5. Returns `200 { ok: true }` if the GitHub hook succeeded (the authoritative action), or `500` if it threw.

- [ ] **Step 1: Write the failing tests**

```ts
// src/app/api/journal/ingest/__tests__/ingest.test.ts
import * as Sentry from '@sentry/nextjs'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import type { IngestPayload } from '@/lib/journal-ingest'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@/lib/journal-hooks', () => ({
  githubCommitHook: vi.fn(),
  typefullyDraftHook: vi.fn(),
}))
vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({ text: 'Punchier reframe.' }),
}))

const makeRequest = (
  body: unknown,
  secret = 'test_secret'
): Request =>
  new Request('http://localhost/api/journal/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  })

const validPayload: IngestPayload = {
  body: 'Rust clicked today.',
  tags: ['rust'],
  date: '2026-05-24',
  images: [],
}

describe('POST /api/journal/ingest', () => {
  let POST: (req: Request) => Promise<Response>
  let githubCommitHook: ReturnType<typeof vi.fn>
  let typefullyDraftHook: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
    vi.resetModules()
    ;({ POST } = await import('../route'))
    ;({ githubCommitHook, typefullyDraftHook } = await import('@/lib/journal-hooks'))
  })

  beforeEach(() => {
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
    vi.mocked(githubCommitHook).mockResolvedValue(undefined)
    vi.mocked(typefullyDraftHook).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.mocked(Sentry.captureException).mockClear()
    vi.mocked(githubCommitHook).mockClear()
    vi.mocked(typefullyDraftHook).mockClear()
  })

  afterAll(() => {
    delete process.env.JOURNAL_INGEST_SECRET
  })

  test('returns 401 when Authorization header is missing', async () => {
    const req = new Request('http://localhost/api/journal/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  test('returns 401 when secret does not match', async () => {
    const res = await POST(makeRequest(validPayload, 'wrong_secret'))
    expect(res.status).toBe(401)
  })

  test('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost/api/journal/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_secret',
      },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  test('returns 400 when body field is missing', async () => {
    const res = await POST(makeRequest({ tags: [], date: '2026-05-24', images: [] }))
    expect(res.status).toBe(400)
  })

  test('runs githubCommitHook and typefullyDraftHook on valid payload', async () => {
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(githubCommitHook).toHaveBeenCalledWith(validPayload)
    expect(typefullyDraftHook).toHaveBeenCalledWith(validPayload, 'Punchier reframe.')
  })

  test('returns 500 and captures to Sentry when githubCommitHook throws', async () => {
    vi.mocked(githubCommitHook).mockRejectedValue(new Error('GitHub API error'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(500)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })

  test('still returns 200 when only typefullyDraftHook throws', async () => {
    vi.mocked(typefullyDraftHook).mockRejectedValue(new Error('Typefully error'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/app/api/journal/ingest/__tests__/ingest.test.ts
```

Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement `src/app/api/journal/ingest/route.ts`**

```ts
// src/app/api/journal/ingest/route.ts
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { githubCommitHook, typefullyDraftHook } from '@/lib/journal-hooks'
import type { IngestPayload } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

function isValidPayload(v: unknown): v is IngestPayload {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.body === 'string' &&
    Array.isArray(p.tags) &&
    typeof p.date === 'string' &&
    Array.isArray(p.images)
  )
}

async function reframeForSocial(body: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-3-5' as never,
      messages: [
        {
          role: 'user',
          content: `Reframe this journal entry as a punchy tweet (max 280 chars). Different angle, not a copy. No hashtags. Just the text:\n\n${body}`,
        },
      ],
    })
    return text.trim() || body
  } catch (err) {
    Sentry.captureException(err)
    return body
  }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.JOURNAL_INGEST_SECRET
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: IngestPayload
  try {
    const raw = await request.json()
    if (!isValidPayload(raw)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    payload = raw
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Hook 1: GitHub commit (authoritative — failure = 500)
  try {
    await githubCommitHook(payload)
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'GitHub commit failed' }, { status: 500 })
  }

  // Hook 2: Typefully draft (non-blocking — failure = logged only)
  const draftContent = await reframeForSocial(payload.body)
  try {
    await typefullyDraftHook(payload, draftContent)
  } catch (err) {
    Sentry.captureException(err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/app/api/journal/ingest/__tests__/ingest.test.ts --reporter=verbose
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/journal/ingest/route.ts src/app/api/journal/ingest/__tests__/ingest.test.ts
git commit -m "feat(journal): core ingest POST handler with hook sequencer"
```

---

## Task 5: Postmark Email Adapter

**Files:**
- Create: `src/app/api/journal/ingest/email/route.ts`
- Create: `src/app/api/journal/ingest/email/__tests__/email.test.ts`

Postmark POSTs a JSON body to this route for every inbound email. The relevant fields are:

```ts
// Postmark inbound payload (relevant subset)
{
  TextBody: string         // plain-text email body
  Attachments: Array<{
    Name: string           // filename e.g. 'photo.jpg'
    Content: string        // base64-encoded file content
    ContentType: string    // 'image/jpeg' etc.
  }>
}
```

The adapter:
1. Validates the `X-Postmark-Token` header against `POSTMARK_INBOUND_TOKEN`.
2. Extracts the plain-text body and image attachments (images are already base64 in the Postmark payload — upload them to a temporary URL or pass them directly if the GitHub hook supports base64 input). 

**Simplification:** Rather than re-uploading attachments to a staging server, this adapter converts Postmark base64 attachments to `data:` URIs. The `githubCommitHook` already handles `data:` URI images by decoding them — update the hook to support both `https://` URLs and `data:` URIs.

Wait — actually the simpler path is to extend `IngestImage` to optionally carry raw base64 content, and have the GitHub hook use that directly rather than downloading. We add `contentBase64?: string` to `IngestImage`. When `contentBase64` is present, the hook uses it directly. When absent, it fetches the URL.

- [ ] **Step 1: Update `IngestImage` in `src/lib/journal-ingest.ts`**

```ts
export interface IngestImage {
  url: string           // original URL (may be empty string when contentBase64 is set)
  filename: string
  contentBase64?: string // raw base64 content; when present, skip the fetch
}
```

- [ ] **Step 2: Update `githubCommitHook` in `src/lib/journal-hooks.ts` to use `contentBase64` when present**

Replace the image loop in `githubCommitHook`:

```ts
  for (const image of payload.images) {
    let imgContent: string

    if (image.contentBase64) {
      imgContent = image.contentBase64
    } else {
      const imgRes = await fetch(image.url)
      if (!imgRes.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch image ${image.url}: ${imgRes.status}`)
        )
        continue
      }
      const arrayBuffer = await imgRes.arrayBuffer()
      imgContent = Buffer.from(arrayBuffer).toString('base64')
    }

    await githubPut(
      `public/images/journal/${payload.date}/${image.filename}`,
      imgContent,
      `journal: ${payload.date} (images)`,
      token,
      owner,
      repo
    )
  }
```

- [ ] **Step 3: Write failing tests for the email adapter**

```ts
// src/app/api/journal/ingest/email/__tests__/email.test.ts
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import type { IngestPayload } from '@/lib/journal-ingest'

vi.mock('@/lib/journal-ingest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/journal-ingest')>()
  return { ...actual }
})

// Mock the core ingest handler so we can inspect what payload the adapter builds.
vi.mock('@/app/api/journal/ingest/route', () => ({
  POST: vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
}))

const makePostmarkRequest = (
  body: unknown,
  token = 'pm_test_token'
): Request =>
  new Request('http://localhost/api/journal/ingest/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Postmark-Token': token,
    },
    body: JSON.stringify(body),
  })

const validPostmarkPayload = {
  TextBody: 'Rust clicked today. #rust #programming',
  Attachments: [],
}

describe('POST /api/journal/ingest/email', () => {
  let POST: (req: Request) => Promise<Response>
  let corePost: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    process.env.POSTMARK_INBOUND_TOKEN = 'pm_test_token'
    vi.resetModules()
    ;({ POST } = await import('../route'))
    ;({ POST: corePost } = await import('@/app/api/journal/ingest/route'))
  })

  beforeEach(() => {
    process.env.POSTMARK_INBOUND_TOKEN = 'pm_test_token'
  })

  afterEach(() => {
    vi.mocked(corePost).mockClear()
  })

  afterAll(() => {
    delete process.env.POSTMARK_INBOUND_TOKEN
  })

  test('returns 401 when X-Postmark-Token is wrong', async () => {
    const res = await POST(makePostmarkRequest(validPostmarkPayload, 'wrong'))
    expect(res.status).toBe(401)
  })

  test('normalises Postmark payload and calls core handler', async () => {
    const res = await POST(makePostmarkRequest(validPostmarkPayload))
    expect(res.status).toBe(200)
    expect(corePost).toHaveBeenCalledTimes(1)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.body).toBe('Rust clicked today.')
    expect(forwarded.tags).toEqual(['rust', 'programming'])
    expect(forwarded.images).toEqual([])
    expect(forwarded.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('converts image attachments to contentBase64 images', async () => {
    const fakeContent = Buffer.from('fake-image').toString('base64')
    const payload = {
      TextBody: 'Photo day.',
      Attachments: [
        { Name: 'photo.jpg', Content: fakeContent, ContentType: 'image/jpeg' },
      ],
    }

    const res = await POST(makePostmarkRequest(payload))
    expect(res.status).toBe(200)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.images).toHaveLength(1)
    expect(forwarded.images[0].filename).toBe('photo-1.jpg')
    expect(forwarded.images[0].contentBase64).toBe(fakeContent)
  })

  test('ignores non-image attachments', async () => {
    const payload = {
      TextBody: 'Note with PDF.',
      Attachments: [
        {
          Name: 'doc.pdf',
          Content: Buffer.from('pdf').toString('base64'),
          ContentType: 'application/pdf',
        },
      ],
    }

    const res = await POST(makePostmarkRequest(payload))
    expect(res.status).toBe(200)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.images).toHaveLength(0)
  })

  test('returns 400 for malformed Postmark JSON', async () => {
    const req = new Request('http://localhost/api/journal/ingest/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Postmark-Token': 'pm_test_token',
      },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
pnpm vitest run src/app/api/journal/ingest/email/__tests__/email.test.ts
```

Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 5: Implement `src/app/api/journal/ingest/email/route.ts`**

```ts
// src/app/api/journal/ingest/email/route.ts
import { NextResponse } from 'next/server'
import { POST as corePost } from '@/app/api/journal/ingest/route'
import type { IngestImage, IngestPayload } from '@/lib/journal-ingest'
import { extractTags, todaySlug } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

interface PostmarkAttachment {
  Name: string
  Content: string      // base64
  ContentType: string
}

interface PostmarkInboundPayload {
  TextBody?: string
  Attachments?: PostmarkAttachment[]
}

export async function POST(request: Request): Promise<Response> {
  const token = process.env.POSTMARK_INBOUND_TOKEN
  const inboundToken = request.headers.get('x-postmark-token') ?? ''

  if (!token || inboundToken !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: PostmarkInboundPayload
  try {
    raw = (await request.json()) as PostmarkInboundPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { body, tags } = extractTags(raw.TextBody ?? '')

  const images: IngestImage[] = (raw.Attachments ?? [])
    .filter((a) => a.ContentType.startsWith('image/'))
    .map((a, i) => {
      const ext = a.Name.split('.').pop() ?? 'jpg'
      return {
        url: '',
        filename: `photo-${i + 1}.${ext}`,
        contentBase64: a.Content,
      }
    })

  const payload: IngestPayload = {
    body,
    tags,
    date: todaySlug(),
    images,
  }

  // Forward to core ingest handler (which validates auth again via its own secret).
  // We bypass auth here by calling the function directly and injecting the correct header.
  const secret = process.env.JOURNAL_INGEST_SECRET ?? ''
  const coreRequest = new Request('http://localhost/api/journal/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  })

  return corePost(coreRequest)
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm vitest run src/app/api/journal/ingest/email/__tests__/email.test.ts --reporter=verbose
```

Expected: All 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add \
  src/lib/journal-ingest.ts \
  src/lib/journal-hooks.ts \
  src/lib/__tests__/journal-hooks.test.ts \
  src/app/api/journal/ingest/email/route.ts \
  src/app/api/journal/ingest/email/__tests__/email.test.ts
git commit -m "feat(journal): Postmark email adapter + contentBase64 image support"
```

---

## Task 6: Twilio WhatsApp Adapter

**Files:**
- Create: `src/app/api/journal/ingest/whatsapp/route.ts`
- Create: `src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts`

Twilio POSTs `application/x-www-form-urlencoded` bodies. The adapter:
1. Validates the Twilio webhook signature using HMAC-SHA1 (`crypto.createHmac`).
2. Parses the body: `Body` = message text, `MediaUrl0`–`MediaUrl9` = image URLs, `MediaContentType0`–`MediaContentType9` = MIME types.
3. Downloads each image URL immediately (Twilio media URLs expire).
4. Normalises and calls the core handler.

**Twilio signature validation:** Twilio signs requests with `HMAC-SHA1(authToken, url + sorted_params)`. The `X-Twilio-Signature` header contains the base64 signature.

- [ ] **Step 1: Write failing tests**

```ts
// src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts
import crypto from 'crypto'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import type { IngestPayload } from '@/lib/journal-ingest'

vi.mock('@/app/api/journal/ingest/route', () => ({
  POST: vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
}))

const AUTH_TOKEN = 'twilio_auth_test'
const WEBHOOK_URL = 'https://blog.kochie.io/api/journal/ingest/whatsapp'

function twilioSignature(authToken: string, url: string, params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys.map((k) => `${k}${params[k]}`).join('')
  const data = url + paramString
  return crypto.createHmac('sha1', authToken).update(data, 'utf8').digest('base64')
}

function makeFormRequest(params: Record<string, string>, sig?: string): Request {
  const body = new URLSearchParams(params).toString()
  const signature = sig ?? twilioSignature(AUTH_TOKEN, WEBHOOK_URL, params)
  return new Request(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Twilio-Signature': signature,
    },
    body,
  })
}

const server = setupServer()

describe('POST /api/journal/ingest/whatsapp', () => {
  let POST: (req: Request) => Promise<Response>
  let corePost: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN
    process.env.TWILIO_WEBHOOK_URL = WEBHOOK_URL
    vi.resetModules()
    ;({ POST } = await import('../route'))
    ;({ POST: corePost } = await import('@/app/api/journal/ingest/route'))
    server.listen({ onUnhandledRequest: 'error' })
  })

  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN
    process.env.TWILIO_WEBHOOK_URL = WEBHOOK_URL
  })

  afterEach(() => {
    server.resetHandlers()
    vi.mocked(corePost).mockClear()
  })

  afterAll(() => {
    server.close()
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WEBHOOK_URL
  })

  test('returns 401 when Twilio signature is invalid', async () => {
    const params = { Body: 'Hello' }
    const res = await POST(makeFormRequest(params, 'bad_signature'))
    expect(res.status).toBe(401)
  })

  test('normalises WhatsApp text payload and calls core handler', async () => {
    const params = { Body: 'Rust clicked today. #rust #programming' }
    const res = await POST(makeFormRequest(params))
    expect(res.status).toBe(200)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.body).toBe('Rust clicked today.')
    expect(forwarded.tags).toEqual(['rust', 'programming'])
    expect(forwarded.images).toEqual([])
  })

  test('downloads media URLs and includes them as images', async () => {
    server.use(
      http.get('https://api.twilio.com/media/photo.jpg', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(8), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      )
    )

    const params = {
      Body: 'Photo!',
      MediaUrl0: 'https://api.twilio.com/media/photo.jpg',
      MediaContentType0: 'image/jpeg',
      NumMedia: '1',
    }

    const res = await POST(makeFormRequest(params))
    expect(res.status).toBe(200)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.images).toHaveLength(1)
    expect(forwarded.images[0].filename).toBe('photo-1.jpg')
    expect(typeof forwarded.images[0].contentBase64).toBe('string')
    expect(forwarded.images[0].contentBase64!.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts
```

Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement `src/app/api/journal/ingest/whatsapp/route.ts`**

```ts
// src/app/api/journal/ingest/whatsapp/route.ts
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { POST as corePost } from '@/app/api/journal/ingest/route'
import type { IngestImage, IngestPayload } from '@/lib/journal-ingest'
import { extractTags, todaySlug } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys.map((k) => `${k}${params[k]}`).join('')
  const data = url + paramString
  const expected = crypto
    .createHmac('sha1', authToken)
    .update(data, 'utf8')
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(request: Request): Promise<Response> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL
  const twilioSig = request.headers.get('x-twilio-signature') ?? ''

  if (!authToken || !webhookUrl) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries())

  let signatureValid = false
  try {
    signatureValid = validateTwilioSignature(authToken, webhookUrl, params, twilioSig)
  } catch {
    signatureValid = false
  }

  if (!signatureValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { body, tags } = extractTags(params.Body ?? '')
  const numMedia = parseInt(params.NumMedia ?? '0', 10)

  const images: IngestImage[] = []
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`]
    const contentType = params[`MediaContentType${i}`] ?? ''

    if (!url || !contentType.startsWith('image/')) continue

    try {
      const imgRes = await fetch(url)
      if (!imgRes.ok) continue
      const arrayBuffer = await imgRes.arrayBuffer()
      const ext = contentType.split('/')[1] ?? 'jpg'
      images.push({
        url,
        filename: `photo-${images.length + 1}.${ext}`,
        contentBase64: Buffer.from(arrayBuffer).toString('base64'),
      })
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const payload: IngestPayload = {
    body,
    tags,
    date: todaySlug(),
    images,
  }

  const secret = process.env.JOURNAL_INGEST_SECRET ?? ''
  const coreRequest = new Request('http://localhost/api/journal/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  })

  return corePost(coreRequest)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts --reporter=verbose
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Run the full ingest test suite**

```bash
pnpm vitest run src/lib/__tests__/journal-ingest.test.ts \
               src/lib/__tests__/journal-hooks.test.ts \
               src/app/api/journal/ingest/__tests__/ingest.test.ts \
               src/app/api/journal/ingest/email/__tests__/email.test.ts \
               src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts \
               --reporter=verbose
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  src/app/api/journal/ingest/whatsapp/route.ts \
  src/app/api/journal/ingest/whatsapp/__tests__/whatsapp.test.ts
git commit -m "feat(journal): Twilio WhatsApp adapter with HMAC signature validation"
```

---

## Environment Variable Checklist

Add these to your Vercel project environment variables (Production + Preview + Development as appropriate):

| Variable | Required for |
|---|---|
| `JOURNAL_INGEST_SECRET` | Auth for the core `/api/journal/ingest` endpoint |
| `GITHUB_TOKEN` | GitHub PAT with `contents:write` on the repo |
| `GITHUB_OWNER` | GitHub username, e.g. `kochie` |
| `GITHUB_REPO` | Repo name, e.g. `blog.kochie.io` |
| `POSTMARK_INBOUND_TOKEN` | Validates Postmark inbound webhook |
| `TWILIO_AUTH_TOKEN` | Validates Twilio webhook HMAC signatures |
| `TWILIO_WEBHOOK_URL` | Full public URL of the WhatsApp webhook route (needed for signature validation) |
| `TYPEFULLY_API_KEY` | Typefully API key for draft creation |

Vercel AI Gateway credentials are managed by the Vercel platform — no extra key needed.
