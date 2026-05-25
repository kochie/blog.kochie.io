import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import type { JournalEntry, MonthGroup } from '@/lib/journal-path'

afterEach(cleanup)

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ replace: vi.fn() }),
}))

import { JournalFeed } from '../index'

const makeEntry = (slug: string, tags: string[]): JournalEntry => ({
  slug,
  date: slug,
  tags,
  body: `Body for ${slug}`,
  bodyHtml: `<p>Body for ${slug}</p>`,
  prev: null,
  next: null,
})

const groups: MonthGroup[] = [
  {
    label: 'May 2026',
    entries: [
      makeEntry('2026-05-24', ['rust', 'programming']),
      makeEntry('2026-05-22', ['melbourne']),
    ],
  },
  {
    label: 'April 2026',
    entries: [makeEntry('2026-04-30', ['rust'])],
  },
]

describe('JournalFeed', () => {
  it('renders all month group headings', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
      />
    )
    expect(screen.getByText('May 2026')).toBeTruthy()
    expect(screen.getByText('April 2026')).toBeTruthy()
  })

  it('renders all entries when no tag is active', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
      />
    )
    expect(screen.getByText(/Body for 2026-05-24/)).toBeTruthy()
    expect(screen.getByText(/Body for 2026-05-22/)).toBeTruthy()
    expect(screen.getByText(/Body for 2026-04-30/)).toBeTruthy()
  })

  it('renders a filter chip for each tag', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
      />
    )
    expect(screen.getByRole('button', { name: 'melbourne' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'rust' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'programming' })).toBeTruthy()
  })

  it('clicking a tag button does not throw an error', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
      />
    )
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'rust' }))
    }).not.toThrow()
  })
})
