import { describe, it, expect } from 'vitest'
import { isoWeek, buildHeatmapGrid } from '../date-utils'

describe('isoWeek', () => {
  it('returns week 1 for 2024-01-01 (Monday)', () => {
    expect(isoWeek(new Date('2024-01-01'))).toEqual({ year: 2024, week: 1 })
  })

  it('returns week 52 for 2021-01-03 (Sunday, last week of 2020 ISO year)', () => {
    // 2021-01-03 belongs to ISO week 53 of 2020
    expect(isoWeek(new Date('2021-01-03'))).toEqual({ year: 2020, week: 53 })
  })

  it('handles week 53 in 2020', () => {
    expect(isoWeek(new Date('2020-12-31'))).toEqual({ year: 2020, week: 53 })
  })

  it('returns week 1 for 2021-01-04 (Monday)', () => {
    expect(isoWeek(new Date('2021-01-04'))).toEqual({ year: 2021, week: 1 })
  })

  it('returns correct week for a mid-year date', () => {
    // 2023-05-07 is a Sunday — ISO week 18 of 2023
    expect(isoWeek(new Date('2023-05-07'))).toEqual({ year: 2023, week: 18 })
  })
})

describe('buildHeatmapGrid', () => {
  it('returns empty maps for years with no articles', () => {
    const grid = buildHeatmapGrid([], 2021, 2021)
    expect(grid.get(2021)?.get(1)).toBeUndefined()
  })

  it('counts one article in the correct year and week', () => {
    const grid = buildHeatmapGrid(
      [{ publishedDate: '2023-05-07T10:00:00+10:00' }],
      2023,
      2023
    )
    expect(grid.get(2023)?.get(18)).toBe(1)
  })

  it('counts multiple articles in the same week', () => {
    const grid = buildHeatmapGrid(
      [
        { publishedDate: '2023-05-04T10:00:00+10:00' }, // week 18
        { publishedDate: '2023-05-07T10:00:00+10:00' }, // week 18
      ],
      2023,
      2023
    )
    expect(grid.get(2023)?.get(18)).toBe(2)
  })

  it('creates grid entries for all years in range', () => {
    const grid = buildHeatmapGrid([], 2021, 2023)
    expect(grid.has(2021)).toBe(true)
    expect(grid.has(2022)).toBe(true)
    expect(grid.has(2023)).toBe(true)
  })
})
