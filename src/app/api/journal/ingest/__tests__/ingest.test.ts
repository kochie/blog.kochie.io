// @vitest-environment node
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

const makeRequest = (body: unknown, secret = 'test_secret'): Request =>
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
    ;({ githubCommitHook, typefullyDraftHook } =
      await import('@/lib/journal-hooks'))
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
    const res = await POST(
      makeRequest({ tags: [], date: '2026-05-24', images: [] })
    )
    expect(res.status).toBe(400)
  })

  test('runs githubCommitHook and typefullyDraftHook on valid payload', async () => {
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(githubCommitHook).toHaveBeenCalledWith(validPayload)
    expect(typefullyDraftHook).toHaveBeenCalledWith(
      validPayload,
      'Punchier reframe.'
    )
  })

  test('returns 500 and captures to Sentry when githubCommitHook throws', async () => {
    vi.mocked(githubCommitHook).mockRejectedValue(new Error('GitHub API error'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(500)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })

  test('still returns 200 when only typefullyDraftHook throws', async () => {
    vi.mocked(typefullyDraftHook).mockRejectedValue(
      new Error('Typefully error')
    )
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })
})
