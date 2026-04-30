/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import PrevNext from '../index'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const fix = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: '',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '',
    indexPath: '',
    articleDir: '',
    publishedDate: '',
    editedDate: '',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('PrevNext', () => {
  it('renders both prev and next when both are provided', () => {
    const { getByText } = render(
      <PrevNext
        prev={fix({ articleDir: '11-prev', title: 'Previous one' })}
        next={fix({ articleDir: '13-next', title: 'Next one' })}
      />
    )
    expect(getByText('Previous one')).toBeTruthy()
    expect(getByText('Next one')).toBeTruthy()
  })

  it('renders only the next card when prev is null', () => {
    const { getByText, queryByText } = render(
      <PrevNext prev={null} next={fix({ articleDir: '13', title: 'Older' })} />
    )
    expect(getByText('Older')).toBeTruthy()
    expect(queryByText(/Newer essay/i)).toBeNull()
  })

  it('renders nothing if both are null', () => {
    const { container } = render(<PrevNext prev={null} next={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('links each card to /articles/{articleDir}', () => {
    const { container } = render(
      <PrevNext
        prev={fix({ articleDir: '11-prev', title: 'P' })}
        next={fix({ articleDir: '13-next', title: 'N' })}
      />
    )
    const links = container.querySelectorAll('a[href^="/articles/"]')
    expect(Array.from(links).map((a) => a.getAttribute('href'))).toEqual([
      '/articles/11-prev',
      '/articles/13-next',
    ])
  })
})
