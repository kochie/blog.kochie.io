/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import RecentRow from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: '',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '5 min',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('RecentRow', () => {
  it('renders one card per article', () => {
    const { container } = render(
      <RecentRow
        articles={[
          fix({ articleDir: '12-a', title: 'A' }),
          fix({ articleDir: '11-b', title: 'B' }),
          fix({ articleDir: '10-c', title: 'C' }),
        ]}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('/articles/12-a')
  })

  it('renders the article number prefix on each card', () => {
    const { container } = render(
      <RecentRow
        articles={[
          fix({ articleDir: '12-a', title: 'A' }),
          fix({ articleDir: '03-b', title: 'B' }),
        ]}
      />
    )
    expect(container.textContent).toMatch(/\/\/\s*12/)
    expect(container.textContent).toMatch(/\/\/\s*03/)
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<RecentRow articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
