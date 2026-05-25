// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockReaddir, mockReadFile } = vi.hoisted(() => ({
  mockReaddir: vi.fn(),
  mockReadFile: vi.fn(),
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    readdir: mockReaddir,
    readFile: mockReadFile,
  }
})

import {
  getEntries,
  getEntryBySlug,
  getRecentEntries,
  getAllJournalTags,
  groupEntriesByMonth,
} from '../journal-path'

const ENTRY_A = `---
date: 2026-05-24
tags:
  - rust
  - programming
---

Rust's borrow checker finally clicked.`

const ENTRY_B = `---
date: 2026-05-22
tags:
  - melbourne
---

Melbourne's new cycling lane network launched.`

const ENTRY_C = `---
date: 2026-04-30
tags:
  - rust
---

Started the Field Journal redesign.`

describe('journal-path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReaddir.mockResolvedValue([
      '2026-05-24.md',
      '2026-05-22.md',
      '2026-04-30.md',
    ] as any)
    mockReadFile.mockImplementation(async (path: any) => {
      const p = String(path)
      if (p.includes('2026-05-24')) return ENTRY_A as any
      if (p.includes('2026-05-22')) return ENTRY_B as any
      if (p.includes('2026-04-30')) return ENTRY_C as any
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    })
  })

  describe('getEntries', () => {
    it('returns entries sorted newest-first', async () => {
      const entries = await getEntries()
      expect(entries.map((e) => e.slug)).toEqual([
        '2026-05-24',
        '2026-05-22',
        '2026-04-30',
      ])
    })

    it('fills in prev and next links correctly', async () => {
      const entries = await getEntries()
      // newest entry has no next, prev = second-newest
      expect(entries[0].next).toBeNull()
      expect(entries[0].prev).toBe('2026-05-22')
      // middle entry links both ways
      expect(entries[1].next).toBe('2026-05-24')
      expect(entries[1].prev).toBe('2026-04-30')
      // oldest entry has no prev
      expect(entries[2].next).toBe('2026-05-22')
      expect(entries[2].prev).toBeNull()
    })

    it('parses tags correctly', async () => {
      const entries = await getEntries()
      expect(entries[0].tags).toEqual(['rust', 'programming'])
    })

    it('includes rendered bodyHtml', async () => {
      const entries = await getEntries()
      expect(entries[0].bodyHtml).toContain('<p>')
      expect(entries[0].bodyHtml).toContain('borrow checker')
    })

    it('returns empty array when journal directory does not exist', async () => {
      mockReaddir.mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      )
      const entries = await getEntries()
      expect(entries).toEqual([])
    })
  })

  describe('getEntryBySlug', () => {
    it('returns the matching entry', async () => {
      const entry = await getEntryBySlug('2026-05-22')
      expect(entry?.slug).toBe('2026-05-22')
      expect(entry?.tags).toEqual(['melbourne'])
    })

    it('returns null for an unknown slug', async () => {
      const entry = await getEntryBySlug('2026-01-01')
      expect(entry).toBeNull()
    })
  })

  describe('getRecentEntries', () => {
    it('returns the n most recent entries', async () => {
      const entries = await getRecentEntries(2)
      expect(entries).toHaveLength(2)
      expect(entries[0].slug).toBe('2026-05-24')
      expect(entries[1].slug).toBe('2026-05-22')
    })
  })

  describe('getAllJournalTags', () => {
    it('returns unique tags across all entries, sorted', async () => {
      const tags = await getAllJournalTags()
      expect(tags).toEqual(['melbourne', 'programming', 'rust'])
    })
  })

  describe('groupEntriesByMonth', () => {
    it('groups entries by month with formatted labels, newest-group first', async () => {
      const entries = await getEntries()
      const groups = groupEntriesByMonth(entries)
      expect(groups).toHaveLength(2)
      expect(groups[0].label).toBe('May 2026')
      expect(groups[0].entries).toHaveLength(2)
      expect(groups[1].label).toBe('April 2026')
      expect(groups[1].entries).toHaveLength(1)
    })
  })
})
