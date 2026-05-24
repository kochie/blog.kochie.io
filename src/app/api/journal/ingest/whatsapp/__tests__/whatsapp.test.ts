// @vitest-environment node
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
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
    vi.resetModules()
    ;({ POST } = await import('../route'))
    ;({ POST: corePost } = await import('@/app/api/journal/ingest/route'))
    server.listen({ onUnhandledRequest: 'error' })
  })

  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN
    process.env.TWILIO_WEBHOOK_URL = WEBHOOK_URL
    process.env.JOURNAL_INGEST_SECRET = 'test_secret'
    vi.mocked(corePost).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
  })

  afterEach(() => {
    server.resetHandlers()
    vi.mocked(corePost).mockClear()
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WEBHOOK_URL
    delete process.env.JOURNAL_INGEST_SECRET
  })

  afterAll(() => {
    server.close()
  })

  test('returns 401 when Twilio signature is invalid', async () => {
    const params = { Body: 'Hello' }
    const res = await POST(makeFormRequest(params, 'bad_signature'))
    expect(res.status).toBe(401)
  })

  test('normalises WhatsApp text payload and calls core handler', async () => {
    const params = { Body: 'Rust clicked today. #rust #programming', NumMedia: '0' }
    const res = await POST(makeFormRequest(params))
    expect(res.status).toBe(200)
    expect(corePost).toHaveBeenCalledTimes(1)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.body).toBe('Rust clicked today.')
    expect(forwarded.tags).toEqual(['rust', 'programming'])
    expect(forwarded.images).toEqual([])
  })

  test('downloads media URLs and includes them as contentBase64 images', async () => {
    server.use(
      http.get('https://api.twilio.com/media/photo.jpg', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(8), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      )
    )

    const params = {
      Body: 'Photo!',
      NumMedia: '1',
      MediaUrl0: 'https://api.twilio.com/media/photo.jpg',
      MediaContentType0: 'image/jpeg',
    }

    const res = await POST(makeFormRequest(params))
    expect(res.status).toBe(200)
    expect(corePost).toHaveBeenCalledTimes(1)

    const callArg: Request = vi.mocked(corePost).mock.calls[0][0]
    const forwarded = (await callArg.json()) as IngestPayload
    expect(forwarded.images).toHaveLength(1)
    expect(forwarded.images[0].filename).toBe('photo-1.jpg')
    expect(typeof forwarded.images[0].contentBase64).toBe('string')
    expect(forwarded.images[0].contentBase64!.length).toBeGreaterThan(0)
  })
})
