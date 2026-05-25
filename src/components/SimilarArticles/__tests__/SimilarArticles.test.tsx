/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import SimilarArticles from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '5 min read',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('SimilarArticles', () => {
  it('renders nothing when the article list is empty', () => {
    const { container } = render(<SimilarArticles articles={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a card per article with the kicker, title and read time', () => {
    render(
      <SimilarArticles
        articles={[
          fix({
            articleDir: '01-halo-physics',
            title: 'Halo Physics',
            tags: ['gaming', 'physics'],
            blurb: 'How fast does a halo need to spin?',
            readTime: '5 min read',
          }),
        ]}
      />
    )
    expect(screen.getByText('Halo Physics')).toBeTruthy()
    expect(screen.getByText('How fast does a halo need to spin?')).toBeTruthy()
    expect(screen.getByText('5 MIN READ')).toBeTruthy()
    expect(screen.getByText('gaming')).toBeTruthy()
    expect(screen.getByText('physics')).toBeTruthy()
  })

  it('links each card to the article URL', () => {
    render(
      <SimilarArticles
        articles={[fix({ articleDir: '02-test', title: 'Test' })]}
      />
    )
    const link = screen.getByRole('link', { name: /Test/i })
    expect(link.getAttribute('href')).toBe('/articles/02-test')
  })

  it('uses the leading numeric prefix as a kicker number when present', () => {
    const { container } = render(
      <SimilarArticles
        articles={[
          fix({
            articleDir: '07-yeav-update',
            title: 'Yeav Update',
            tags: ['business'],
          }),
        ]}
      />
    )
    // The first card's kicker formats as `// 07`.
    const card = container.querySelector('a[href="/articles/07-yeav-update"]')
    const kicker = card?.querySelector('span.text-accent')
    expect(kicker?.textContent).toBe('// 07')
  })
})
