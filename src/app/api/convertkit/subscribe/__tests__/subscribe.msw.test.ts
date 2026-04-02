import * as Sentry from '@sentry/nextjs'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

const server = setupServer()

describe('POST /api/convertkit/subscribe', () => {
  let POST: (request: Request) => Promise<Response>

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })
    process.env.CONVERTKIT_API_KEY = 'test-api-key'
    vi.resetModules()
    ;({ POST } = await import('../route'))
  })

  afterEach(() => {
    server.resetHandlers()
    vi.mocked(Sentry.captureException).mockClear()
  })

  afterAll(() => {
    server.close()
    delete process.env.CONVERTKIT_API_KEY
  })

  test('forwards subscribe payload to ConvertKit and returns 200', async () => {
    server.use(
      http.post(
        'https://api.convertkit.com/v3/forms/:formId/subscribe',
        async ({ request, params }) => {
          expect(params.formId).toBe('12345')
          expect(await request.json()).toEqual({
            api_key: 'test-api-key',
            email: 'reader@example.com',
            first_name: 'Pat',
          })
          return HttpResponse.json({ subscription: { state: 'active' } })
        }
      )
    )

    const res = await POST(
      new Request('http://localhost/api/convertkit/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: '12345',
          email: 'reader@example.com',
          name: 'Pat',
        }),
      })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  test('returns 400 when ConvertKit responds with a non-OK status', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    server.use(
      http.post('https://api.convertkit.com/v3/forms/:formId/subscribe', () =>
        HttpResponse.json({ message: 'invalid' }, { status: 422 })
      )
    )

    try {
      const res = await POST(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: '1',
            email: 'a@b.co',
            name: 'x',
          }),
        })
      )

      expect(res.status).toBe(400)
      const body = (await res.json()) as { error: string }
      expect(body.error).toBe('Bad response')
      expect(consoleError).toHaveBeenCalledWith(
        '[convertkit] subscribe failed:',
        422,
        'Unprocessable Entity'
      )
    } finally {
      consoleError.mockRestore()
    }
  })

  test('returns 400 for JSON null body', async () => {
    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'null',
      })
    )

    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('No body')
  })

  test('returns 400 and reports to Sentry when fetch fails', async () => {
    server.use(
      http.post('https://api.convertkit.com/v3/forms/:formId/subscribe', () =>
        HttpResponse.error()
      )
    )

    const res = await POST(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: '9',
          email: 'e@e.co',
          name: 'Err',
        }),
      })
    )

    expect(res.status).toBe(400)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })
})
