import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { JournalEntryPage } from '../index'
import type { JournalEntry } from '@/lib/journal-path'

afterEach(cleanup)

const entry: JournalEntry = {
  slug: '2026-05-24',
  date: '2026-05-24',
  tags: ['rust', 'programming'],
  body: "Rust's borrow checker finally clicked.",
  bodyHtml: "<p>Rust's borrow checker finally clicked.</p>",
  prev: '2026-05-22',
  next: null,
}

const relatedEntry: JournalEntry = {
  slug: '2026-04-30',
  date: '2026-04-30',
  tags: ['rust'],
  body: 'Started the Field Journal redesign.',
  bodyHtml: '<p>Started the Field Journal redesign.</p>',
  prev: null,
  next: '2026-05-22',
}

describe('JournalEntryPage', () => {
  it('renders the formatted date as a heading', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    // Should contain the day and month
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/24/)
  })

  it('renders the body HTML', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.getByText(/borrow checker finally clicked/)).toBeTruthy()
  })

  it('renders tag chips linked to tag pages', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    const rustLink = screen.getByRole('link', { name: 'rust' })
    expect(rustLink.getAttribute('href')).toBe('/tags/rust')
  })

  it('renders prev navigation link when prev is set', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    const prevLink = screen.getByRole('link', { name: /2026-05-22/ })
    expect(prevLink.getAttribute('href')).toBe('/journal/2026-05-22')
  })

  it('does not render next navigation when next is null', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.queryByRole('link', { name: /next/i })).toBeNull()
  })

  it('renders the related entries section when related is non-empty', () => {
    render(<JournalEntryPage entry={entry} related={[relatedEntry]} />)
    expect(screen.getByText(/RELATED ENTRIES/)).toBeTruthy()
    expect(screen.getByText(/Field Journal redesign/)).toBeTruthy()
  })

  it('omits the related section when related is empty', () => {
    render(<JournalEntryPage entry={entry} related={[]} />)
    expect(screen.queryByText(/RELATED ENTRIES/)).toBeNull()
  })
})
