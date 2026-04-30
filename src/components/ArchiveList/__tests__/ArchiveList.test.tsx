/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ArchiveList from '../index'
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
    publishedDate: '',
    editedDate: '',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('ArchiveList', () => {
  it('groups rows under year headers', () => {
    const { container } = render(
      <ArchiveList
        articles={[
          fix({
            articleDir: '13-third',
            title: '2025 third',
            publishedDate: '2025-03-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '12-second',
            title: '2024 second',
            publishedDate: '2024-12-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '11-first',
            title: '2024 first',
            publishedDate: '2024-06-01T00:00:00.000Z',
          }),
        ]}
      />
    )
    const yearLabels = container.querySelectorAll('[data-year]')
    expect(
      Array.from(yearLabels).map((y) => y.getAttribute('data-year'))
    ).toEqual(['2025', '2024'])
  })

  it('renders a row per article with title and link', () => {
    const { container } = render(
      <ArchiveList
        articles={[
          fix({
            articleDir: '13-x',
            title: 'X',
            publishedDate: '2025-03-01T00:00:00.000Z',
          }),
          fix({
            articleDir: '12-y',
            title: 'Y',
            publishedDate: '2024-12-01T00:00:00.000Z',
          }),
        ]}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('/articles/13-x')
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<ArchiveList articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
