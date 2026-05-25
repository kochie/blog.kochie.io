// @vitest-environment node
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

// Mock the core ingest handler so we can inspect what payload the adapter builds.
vi.mock('@/app/api/journal/ingest/route', () => ({
  POST: vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ),
}))

const makePostmarkRequest = (body: unknown, token = 'pm_test_token'): Request =>
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
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
    vi.resetModules()
    ;({ POST } = await import('../route'))
    ;({ POST: corePost } = await import('@/app/api/journal/ingest/route'))
  })

  beforeEach(() => {
    process.env.POSTMARK_INBOUND_TOKEN = 'pm_test_token'
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
  })

  afterEach(() => {
    vi.mocked(corePost).mockClear()
  })

  afterAll(() => {
    delete process.env.POSTMARK_INBOUND_TOKEN
    delete process.env.JOURNAL_INGEST_SECRET
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
