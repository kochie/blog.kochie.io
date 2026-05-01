import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveAudioUrl, resolvePodcast } from '../podcast-url'

const BEEHIIV_MP3 =
  'https://podcasts.beehiiv.com/922c0dba-6da7-48c1-ac7c-d992719d695f/019d7635-73ea-74bf-947d-b2b7ad423181/019d7637-3215-71fa-8c05-b6dec8a40e4a/019d7637-32dc-7364-98d7-6b8db8bec958.mp3'

const mockFetch = (
  body: string,
  init: { ok?: boolean; status?: number; statusText?: string } = {}
) =>
  vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    text: async () => body,
  })

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveAudioUrl', () => {
  it('passes through a direct mp3 URL without fetching', async () => {
    const fetchMock = mockFetch('')
    vi.stubGlobal('fetch', fetchMock)
    expect(await resolveAudioUrl(BEEHIIV_MP3)).toBe(BEEHIIV_MP3)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('extracts a beehiiv mp3 from the episode page HTML', async () => {
    const html = `<html><body>
      <audio><source src="${BEEHIIV_MP3}" type="audio/mpeg" /></audio>
    </body></html>`
    vi.stubGlobal('fetch', mockFetch(html))
    expect(
      await resolveAudioUrl(
        'https://kochie.beehiiv.com/podcast/s/kochie_engineering/halo_physics'
      )
    ).toBe(BEEHIIV_MP3)
  })

  it('extracts a generic enclosure URL from an RSS feed', async () => {
    const url = 'https://example.com/episode.mp3'
    const xml = `<?xml version="1.0"?>
      <rss><channel><item>
        <enclosure url="${url}" type="audio/mpeg" length="123" />
      </item></channel></rss>`
    vi.stubGlobal('fetch', mockFetch(xml))
    expect(await resolveAudioUrl('https://feeds.example.com/show.xml')).toBe(
      url
    )
  })

  it('falls back to a plain HTML <audio> tag', async () => {
    const url = 'https://cdn.example.com/episode-7.m4a'
    const html = `<html><body><audio controls src="${url}"></audio></body></html>`
    vi.stubGlobal('fetch', mockFetch(html))
    expect(await resolveAudioUrl('https://example.com/show/7')).toBe(url)
  })

  it('throws when the fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch('', { ok: false, status: 404, statusText: 'Not Found' })
    )
    await expect(
      resolveAudioUrl('https://example.com/missing')
    ).rejects.toThrow(/404 Not Found/)
  })

  it('throws when no audio URL can be found in the response', async () => {
    vi.stubGlobal('fetch', mockFetch('<html><body>no audio here</body></html>'))
    await expect(resolveAudioUrl('https://example.com/page')).rejects.toThrow(
      /Could not find an audio URL/
    )
  })
})

describe('resolvePodcast', () => {
  it('returns undefined for missing input', async () => {
    expect(await resolvePodcast(undefined)).toBeUndefined()
    expect(await resolvePodcast(null)).toBeUndefined()
    expect(await resolvePodcast({})).toBeUndefined()
  })

  it('accepts a bare URL string and resolves it', async () => {
    vi.stubGlobal('fetch', mockFetch(`<source src="${BEEHIIV_MP3}" />`))
    const result = await resolvePodcast(
      'https://kochie.beehiiv.com/podcast/s/kochie_engineering/halo_physics'
    )
    expect(result).toEqual({ audio: BEEHIIV_MP3, duration: undefined })
  })

  it('accepts the { audio, duration } object form', async () => {
    expect(
      await resolvePodcast({ audio: BEEHIIV_MP3, duration: '12:34' })
    ).toEqual({ audio: BEEHIIV_MP3, duration: '12:34' })
  })

  it('accepts the { episode, duration } alias and preserves duration', async () => {
    vi.stubGlobal('fetch', mockFetch(`<source src="${BEEHIIV_MP3}" />`))
    const result = await resolvePodcast({
      episode: 'https://kochie.beehiiv.com/podcast/s/show/halo',
      duration: '10:34',
    })
    expect(result).toEqual({ audio: BEEHIIV_MP3, duration: '10:34' })
  })

  it('warns and returns undefined when resolution fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      mockFetch('', { ok: false, status: 500, statusText: 'Server Error' })
    )
    expect(
      await resolvePodcast('https://kochie.beehiiv.com/podcast/s/show/dead')
    ).toBeUndefined()
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/\[podcast\]/))
  })
})
