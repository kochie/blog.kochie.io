// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const CSS = `@font-face { src: url(https://fonts.gstatic.com/s/font.woff2) format('woff2'); }`

const ok = (url: string) =>
  new URL(url).hostname === 'fonts.googleapis.com'
    ? new Response(CSS)
    : new Response(new ArrayBuffer(8))

const timeout = () =>
  Object.assign(new TypeError('fetch failed'), {
    cause: { code: 'ETIMEDOUT' },
  })

async function loadModule() {
  vi.resetModules()
  return import('../og-fonts')
}

describe('loadFieldJournalFonts', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('retries requests that fail with a network error', async () => {
    let failures = 2
    fetchMock.mockImplementation(async (url: string) => {
      if (failures-- > 0) throw timeout()
      return ok(url)
    })
    const { loadFieldJournalFonts } = await loadModule()

    const fonts = loadFieldJournalFonts()
    await vi.runAllTimersAsync()

    await expect(fonts).resolves.toHaveLength(3)
  })

  it('gives up after repeated failures and lets the next call retry', async () => {
    fetchMock.mockRejectedValue(timeout())
    const { loadFieldJournalFonts } = await loadModule()

    const first = loadFieldJournalFonts()
    const assertion = expect(first).rejects.toThrow('fetch failed')
    await vi.runAllTimersAsync()
    await assertion

    fetchMock.mockImplementation(async (url: string) => ok(url))
    await expect(loadFieldJournalFonts()).resolves.toHaveLength(3)
  })

  it('fetches the fonts once and reuses them across callers', async () => {
    fetchMock.mockImplementation(async (url: string) => ok(url))
    const { loadFieldJournalFonts } = await loadModule()

    const [a, b] = await Promise.all([
      loadFieldJournalFonts(),
      loadFieldJournalFonts(),
    ])
    await loadFieldJournalFonts()

    expect(a).toBe(b)
    // Three fonts, each a CSS request plus a binary request.
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('does not retry client errors', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 400 }))
    const { loadFieldJournalFonts } = await loadModule()

    await expect(loadFieldJournalFonts()).rejects.toThrow('400')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
