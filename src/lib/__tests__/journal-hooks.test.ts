// @vitest-environment node
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
    delete process.env.GITHUB_TOKEN
    delete process.env.GITHUB_OWNER
    delete process.env.GITHUB_REPO
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
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        expect(request.headers.get('authorization')).toBe('Bearer ghp_test')
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 201 }
        )
      })
    )

    await githubCommitHook(basePayload)

    expect(capturedBody).not.toBeNull()
    const decoded = Buffer.from(
      capturedBody!.content as string,
      'base64'
    ).toString('utf8')
    expect(decoded).toContain('date: 2026-05-24')
    expect(decoded).toContain('tags:')
    expect(decoded).toContain('- rust')
    expect(decoded).toContain('Rust clicked today.')
    expect(capturedBody!.message).toBe('journal: 2026-05-24')
    expect(capturedBody!.sha).toBeUndefined()
  })

  test('sends sha in PUT body when updating an existing file', async () => {
    const existingSha = 'abc123def456'
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json({ sha: existingSha }, { status: 200 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 200 }
        )
      })
    )

    await githubCommitHook(basePayload)

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.sha).toBe(existingSha)
  })

  test('commits image files when images are present', async () => {
    const calls: string[] = []

    server.use(
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async () => {
        calls.push('md')
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 201 }
        )
      }),
      http.get(`${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(
        `${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`,
        async ({ request }) => {
          calls.push('img')
          const body = (await request.json()) as Record<string, unknown>
          expect(body.message).toBe('journal: 2026-05-24 (images)')
          return HttpResponse.json(
            { content: { name: '2026-05-24-photo-1.jpg' } },
            { status: 201 }
          )
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
      images: [
        { url: 'https://example.com/photo.jpg', filename: 'photo-1.jpg' },
      ],
    })

    expect(calls).toContain('md')
    expect(calls).toContain('img')
  })

  test('includes image markdown references in the committed markdown', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 201 }
        )
      }),
      http.get(`${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(
        `${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`,
        async () =>
          HttpResponse.json(
            { content: { name: '2026-05-24-photo-1.jpg' } },
            { status: 201 }
          )
      ),
      http.get('https://example.com/photo.jpg', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(4), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      )
    )

    await githubCommitHook({
      ...basePayload,
      images: [
        { url: 'https://example.com/photo.jpg', filename: 'photo-1.jpg' },
      ],
    })

    expect(capturedBody).not.toBeNull()
    const decoded = Buffer.from(
      capturedBody!.content as string,
      'base64'
    ).toString('utf8')
    expect(decoded).toContain('![](./images/2026-05-24-photo-1.jpg)')
  })

  test('throws when GITHUB_TOKEN is missing', async () => {
    delete process.env.GITHUB_TOKEN
    await expect(githubCommitHook(basePayload)).rejects.toThrow('GITHUB_TOKEN')
  })

  test('throws when GitHub API returns a non-2xx status', async () => {
    server.use(
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json({ message: 'Unprocessable Entity' }, { status: 422 })
      )
    )
    await expect(githubCommitHook(basePayload)).rejects.toThrow(
      'GitHub API error 422'
    )
  })

  test('uses contentBase64 directly without fetching URL when present', async () => {
    const fakeBase64 = Buffer.from('fake-image-data').toString('base64')

    server.use(
      http.get(`${GITHUB_API}/journal/2026-05-24.md`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(`${GITHUB_API}/journal/2026-05-24.md`, async () => {
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 201 }
        )
      }),
      http.get(`${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`, () =>
        HttpResponse.json(null, { status: 404 })
      ),
      http.put(
        `${GITHUB_API}/journal/images/2026-05-24-photo-1.jpg`,
        async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          expect(body.content).toBe(fakeBase64)
          return HttpResponse.json(
            { content: { name: '2026-05-24-photo-1.jpg' } },
            { status: 201 }
          )
        }
      )
    )

    await githubCommitHook({
      ...basePayload,
      images: [{ url: '', filename: 'photo-1.jpg', contentBase64: fakeBase64 }],
    })
    // If URL was fetched, msw would throw an unhandled request error.
  })
})

describe('typefullyDraftHook', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
    delete process.env.TYPEFULLY_API_KEY
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
        expect(request.headers.get('authorization')).toBe('Bearer tf_test_key')
        return HttpResponse.json({ id: 'draft_1' }, { status: 200 })
      })
    )

    const result = await typefullyDraftHook(
      basePayload,
      'AI-reframed punchier version'
    )

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.content).toBe('AI-reframed punchier version')
    expect(capturedBody!['schedule-date']).toBeNull()
    expect(capturedBody!.threadify).toBe(false)
    expect(result).toBe('https://app.typefully.com/?drafts=draft_1')
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
    await expect(typefullyDraftHook(basePayload, 'content')).rejects.toThrow(
      'Typefully API error 401'
    )
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })
})
