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

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

const server = setupServer()

const ENDPOINT =
  'https://api.beehiiv.com/v2/publications/:publicationId/subscriptions'

describe('POST /api/beehiiv/subscribe', () => {
  let POST: (request: Request) => Promise<Response>

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })
    process.env.BEEHIIV_API_KEY = 'test-api-key'
    process.env.BEEHIIV_PUBLICATION_ID = 'pub_test_123'
    vi.resetModules()
    ;({ POST } = await import('../route'))
  })

  beforeEach(() => {
    process.env.BEEHIIV_API_KEY = 'test-api-key'
    process.env.BEEHIIV_PUBLICATION_ID = 'pub_test_123'
  })

  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })

  afterAll(() => {
    server.close()
    delete process.env.BEEHIIV_API_KEY
    delete process.env.BEEHIIV_PUBLICATION_ID
  })

  test('forwards subscribe payload to beehiiv with bearer auth and returns 200', async () => {
    server.use(
      http.post(ENDPOINT, async ({ request, params }) => {
        expect(params.publicationId).toBe('pub_test_123')
        expect(request.headers.get('authorization')).toBe('Bearer test-api-key')
        const body = (await request.json()) as Record<string, unknown>
        expect(body).toMatchObject({
          email: 'reader@example.com',
          send_welcome_email: true,
          reactivate_existing: false,
          utm_source: 'blog.kochie.io',
          utm_medium: 'subscribe-form',
          custom_fields: [{ name: 'First Name', value: 'Pat' }],
        })
        return HttpResponse.json({ data: { id: 'sub_1', status: 'pending' } })
      })
    )

    const res = await POST(
      new Request('http://localhost/api/beehiiv/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reader@example.com',
          name: 'Pat',
        }),
      })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  test('omits custom_fields when name is empty', async () => {
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body).not.toHaveProperty('custom_fields')
        expect(body).toMatchObject({ email: 'reader@example.com' })
        return HttpResponse.json({ data: { id: 'sub_2', status: 'pending' } })
      })
    )

    const res = await POST(
      new Request('http://localhost/api/beehiiv/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'reader@example.com', name: '' }),
      })
    )

    expect(res.status).toBe(200)
  })

  test('returns 400 when beehiiv responds with a non-OK status', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ message: 'invalid' }, { status: 422 })
      )
    )

    try {
      const res = await POST(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'a@b.co' }),
        })
      )

      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Bad response' })
      expect(consoleError).toHaveBeenCalledWith(
        '[beehiiv] subscribe failed:',
        422,
        'Unprocessable Entity'
      )
    } finally {
      consoleError.mockRestore()
    }
  })

  test('returns 400 when email is missing', async () => {
    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Pat' }),
      })
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Email required' })
  })

  test('returns 400 for null body', async () => {
    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'null',
      })
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Email required' })
  })

  test('returns 400 for malformed JSON', async () => {
    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      })
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON' })
  })

  test('returns 400 and reports to Sentry when fetch fails', async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.error()))

    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'e@e.co' }),
      })
    )

    expect(res.status).toBe(400)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })

  test('returns 500 when beehiiv env config is missing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    delete process.env.BEEHIIV_API_KEY

    try {
      const res = await POST(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'e@e.co' }),
        })
      )

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: 'Not configured' })
    } finally {
      consoleError.mockRestore()
    }
  })
})
