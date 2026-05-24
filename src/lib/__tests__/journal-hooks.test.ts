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
    // The content field is base64-encoded frontmatter + body.
    const decoded = Buffer.from(
      capturedBody!.content as string,
      'base64'
    ).toString('utf8')
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
        return HttpResponse.json(
          { content: { name: '2026-05-24.md' } },
          { status: 201 }
        )
      }),
      http.put(
        `${GITHUB_API}/public/images/journal/2026-05-24/photo-1.jpg`,
        async ({ request }) => {
          calls.push('img')
          const body = (await request.json()) as Record<string, unknown>
          expect(body.message).toBe('journal: 2026-05-24 (images)')
          return HttpResponse.json(
            { content: { name: 'photo-1.jpg' } },
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
    await expect(githubCommitHook(basePayload)).rejects.toThrow('GitHub API error 422')
  })
})
