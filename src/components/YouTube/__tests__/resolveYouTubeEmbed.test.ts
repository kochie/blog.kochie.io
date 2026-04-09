import { describe, expect, test } from 'vitest'
import { resolveYouTubeEmbed } from '../resolveYouTubeEmbed'

describe('resolveYouTubeEmbed', () => {
  test('id only', () => {
    const { embedUrl, videoId } = resolveYouTubeEmbed({ id: 'abc123_-01' })
    expect(videoId).toBe('abc123_-01')
    expect(embedUrl).toBe('https://www.youtube.com/embed/abc123_-01')
  })

  test('nocookie id', () => {
    const { embedUrl } = resolveYouTubeEmbed({
      id: 'xyz',
      nocookie: true,
    })
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/xyz')
  })

  test('embed src keeps query', () => {
    const { embedUrl, videoId } = resolveYouTubeEmbed({
      src: 'https://www.youtube.com/embed/foo?si=bar&start=10',
    })
    expect(videoId).toBe('foo')
    expect(embedUrl).toContain('youtube.com/embed/foo')
    expect(embedUrl).toContain('si=bar')
    expect(embedUrl).toContain('start=10')
  })

  test('watch URL', () => {
    const { embedUrl, videoId } = resolveYouTubeEmbed({
      src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42',
    })
    expect(videoId).toBe('dQw4w9WgXcQ')
    expect(embedUrl).toContain('dQw4w9WgXcQ')
    expect(embedUrl).toContain('t=42')
  })

  test('nocookie host inferred', () => {
    const { embedUrl } = resolveYouTubeEmbed({
      src: 'https://www.youtube-nocookie.com/embed/abc',
    })
    expect(
      embedUrl.startsWith('https://www.youtube-nocookie.com/embed/abc')
    ).toBe(true)
  })

  test('throws without id or src', () => {
    expect(() => resolveYouTubeEmbed({})).toThrow(/pass `id`/)
  })
})
