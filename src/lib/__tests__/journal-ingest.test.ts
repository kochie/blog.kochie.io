// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { extractTags, todaySlug } from '../journal-ingest'

describe('extractTags', () => {
  test('extracts trailing hashtags and strips them from body', () => {
    const { body, tags } = extractTags('Great day. #melbourne #cycling')
    expect(body).toBe('Great day.')
    expect(tags).toEqual(['melbourne', 'cycling'])
  })

  test('leaves mid-sentence hashtags in body untouched', () => {
    const { body, tags } = extractTags('Thinking about #rust today')
    expect(body).toBe('Thinking about #rust today')
    expect(tags).toEqual([])
  })

  test('does not treat a leading-only hashtag as trailing', () => {
    const { body, tags } = extractTags('#rust is great')
    expect(body).toBe('#rust is great')
    expect(tags).toEqual([])
  })

  test('extracts trailing run of multiple hashtags', () => {
    const { body, tags } = extractTags('Love this. #rust #programming #tools')
    expect(body).toBe('Love this.')
    expect(tags).toEqual(['rust', 'programming', 'tools'])
  })

  test('handles message that is only hashtags (no body text)', () => {
    const { body, tags } = extractTags('#rust #programming')
    expect(body).toBe('')
    expect(tags).toEqual(['rust', 'programming'])
  })

  test('trims leading/trailing whitespace from body', () => {
    const { body, tags } = extractTags('  Hello world.  #test  ')
    expect(body).toBe('Hello world.')
    expect(tags).toEqual(['test'])
  })

  test('normalises tags to lowercase', () => {
    const { body, tags } = extractTags('Note #Rust #Programming')
    expect(body).toBe('Note')
    expect(tags).toEqual(['rust', 'programming'])
  })

  test('handles empty string input', () => {
    const { body, tags } = extractTags('')
    expect(body).toBe('')
    expect(tags).toEqual([])
  })

  test('preserves newlines between paragraphs', () => {
    const { body, tags } = extractTags(
      'First paragraph.\n\nSecond paragraph. #rust #programming'
    )
    expect(body).toBe('First paragraph.\n\nSecond paragraph.')
    expect(tags).toEqual(['rust', 'programming'])
  })

  test('preserves newlines when hashtags are on their own line', () => {
    const { body, tags } = extractTags(
      'First paragraph.\n\nSecond paragraph.\n\n#rust\n#programming'
    )
    expect(body).toBe('First paragraph.\n\nSecond paragraph.')
    expect(tags).toEqual(['rust', 'programming'])
  })
})

describe('todaySlug', () => {
  test('returns a YYYY-MM-DD format string in UTC', () => {
    expect(todaySlug()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
