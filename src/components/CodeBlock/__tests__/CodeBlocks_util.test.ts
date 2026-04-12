import { calculateLinesToHighlight } from '@/components/CodeBlock/codeblock'
import { describe, expect, test } from 'vitest'

describe('calculateLinesToHighlight', () => {
  test('returns always-false when className has no line marker', () => {
    const fn = calculateLinesToHighlight('language-typescript')
    expect(fn(0)).toBe(false)
    expect(fn(99)).toBe(false)
  })

  test('highlights a single 1-based line', () => {
    const fn = calculateLinesToHighlight('jsx{1}')
    expect(fn(0)).toBe(true)
    expect(fn(1)).toBe(false)
  })

  test('highlights separate lines from a comma list', () => {
    const fn = calculateLinesToHighlight('jsx{2,4}')
    expect(fn(0)).toBe(false)
    expect(fn(1)).toBe(true)
    expect(fn(2)).toBe(false)
    expect(fn(3)).toBe(true)
  })

  test('highlights an inclusive range', () => {
    const fn = calculateLinesToHighlight('jsx{2-4}')
    expect(fn(0)).toBe(false)
    expect(fn(1)).toBe(true)
    expect(fn(2)).toBe(true)
    expect(fn(3)).toBe(true)
    expect(fn(4)).toBe(false)
  })

  test('supports combined ranges and singles', () => {
    const fn = calculateLinesToHighlight('tsx{1,5-7}')
    expect(fn(0)).toBe(true)
    expect(fn(1)).toBe(false)
    expect(fn(4)).toBe(true)
    expect(fn(5)).toBe(true)
    expect(fn(6)).toBe(true)
    expect(fn(7)).toBe(false)
  })
})
