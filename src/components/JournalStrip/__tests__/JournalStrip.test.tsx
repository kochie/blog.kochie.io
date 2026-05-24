/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { JournalStrip } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

afterEach(cleanup)

const makeEntry = (slug: string): JournalEntry => ({
  slug,
  date: slug,
  tags: ['rust'],
  body: `Body for ${slug}.`,
  bodyHtml: `<p>Body for ${slug}.</p>`,
  prev: null,
  next: null,
})

describe('JournalStrip', () => {
  it('renders the section label', () => {
    render(<JournalStrip entries={[makeEntry('2026-05-24')]} />)
    expect(screen.getByText(/FROM THE JOURNAL/)).toBeTruthy()
  })

  it('renders a link to /journal', () => {
    render(<JournalStrip entries={[makeEntry('2026-05-24')]} />)
    const link = screen.getByRole('link', { name: /all entries/i })
    expect(link.getAttribute('href')).toBe('/journal')
  })

  it('renders one card per entry', () => {
    render(
      <JournalStrip
        entries={[makeEntry('2026-05-24'), makeEntry('2026-05-22'), makeEntry('2026-04-30')]}
      />
    )
    // Each compact card shows a link to the permalink
    expect(screen.getByRole('link', { name: /24 May 2026/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /22 May 2026/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /30 Apr 2026/i })).toBeTruthy()
  })

  it('returns null when entries is empty', () => {
    const { container } = render(<JournalStrip entries={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
