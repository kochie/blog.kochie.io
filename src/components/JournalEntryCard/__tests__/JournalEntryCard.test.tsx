import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

afterEach(cleanup)
import { JournalEntryCard } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

const entry: JournalEntry = {
  slug: '2026-05-24',
  date: '2026-05-24',
  tags: ['rust', 'programming'],
  body: "Rust's borrow checker finally clicked. A second sentence follows.",
  bodyHtml:
    "<p>Rust's borrow checker finally clicked. A second sentence follows.</p>",
  prev: '2026-05-22',
  next: null,
}

describe('JournalEntryCard', () => {
  describe('full mode (default)', () => {
    it('renders the body HTML', () => {
      render(<JournalEntryCard entry={entry} />)
      expect(screen.getByText(/borrow checker finally clicked/)).toBeTruthy()
    })

    it('renders tag chips for each tag', () => {
      render(<JournalEntryCard entry={entry} />)
      expect(screen.getByText('rust')).toBeTruthy()
      expect(screen.getByText('programming')).toBeTruthy()
    })

    it('renders the date as a link to the permalink', () => {
      render(<JournalEntryCard entry={entry} />)
      const link = screen.getByRole('link', { name: /24 May 2026/i })
      expect(link.getAttribute('href')).toBe('/journal/2026-05-24')
    })
  })

  describe('compact mode', () => {
    it('renders a truncated plain-text snippet, not full HTML', () => {
      render(<JournalEntryCard entry={entry} compact />)
      // Should show text but not the full second sentence
      expect(screen.getByText(/borrow checker/)).toBeTruthy()
    })

    it('does not render tag chips in compact mode', () => {
      render(<JournalEntryCard entry={entry} compact />)
      expect(screen.queryByText('rust')).toBeNull()
      expect(screen.queryByText('programming')).toBeNull()
    })
  })
})
