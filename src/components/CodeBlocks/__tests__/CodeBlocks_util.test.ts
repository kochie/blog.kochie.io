import { calculateLinesToHighlight } from '@/components/CodeBlocks/codeblock'

describe('calculateLinesToHighlight', () => {
  test('calculates the correct number', () => {
    const tag = `jsx{1}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeTruthy()
  })

  test('calculates the correct pair of numbers', () => {
    const tag = `jsx{2,4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeFalsy()
    expect(valid(3)).toBeTruthy()
  })

  test('calculates the correct range', () => {
    const tag = `jsx{2-4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeTruthy()
    expect(valid(3)).toBeTruthy()
  })
})

describe('calculateLinesToHighlight', () => {
  it('calculates the correct number', () => {
    const tag = `jsx{1}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeTruthy()
  })

  it('calculates the correct pair of numbers', () => {
    const tag = `jsx{2,4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeFalsy()
    expect(valid(3)).toBeTruthy()
  })

  it('calculates the correct range', () => {
    const tag = `jsx{2-4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeTruthy()
    expect(valid(3)).toBeTruthy()
  })
})
