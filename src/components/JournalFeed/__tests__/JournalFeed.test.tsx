import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { FeedGroup } from '../index'

afterEach(cleanup)

import { JournalFeed } from '../index'

const groups: FeedGroup[] = [
  {
    label: 'May 2026',
    entries: [
      {
        slug: '2026-05-24',
        tags: ['rust', 'programming'],
        node: <div>Body for 2026-05-24</div>,
      },
      {
        slug: '2026-05-22',
        tags: ['melbourne'],
        node: <div>Body for 2026-05-22</div>,
      },
    ],
  },
  {
    label: 'April 2026',
    entries: [
      {
        slug: '2026-04-30',
        tags: ['rust'],
        node: <div>Body for 2026-04-30</div>,
      },
    ],
  },
]

describe('JournalFeed', () => {
  it('renders all month group headings', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
        activeTag={null}
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
        activeTag={null}
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
        activeTag={null}
      />
    )
    expect(screen.getByRole('link', { name: 'melbourne' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'rust' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'programming' })).toBeTruthy()
  })

  it('active tag chip links back to /journal to deselect', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
        activeTag="rust"
      />
    )
    const rustLinks = screen.getAllByRole('link', { name: 'rust' })
    expect(rustLinks.some((l) => l.getAttribute('href') === '/journal')).toBe(
      true
    )
  })

  it('inactive tag chip links to ?tag= filter URL', () => {
    render(
      <JournalFeed
        groups={groups}
        allTags={['melbourne', 'programming', 'rust']}
        activeTag={null}
      />
    )
    const rustLink = screen.getByRole('link', { name: 'rust' })
    expect(rustLink.getAttribute('href')).toBe('/journal?tag=rust')
  })
})
