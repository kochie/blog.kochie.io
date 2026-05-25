/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import HeroFeature from '../index'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'

afterEach(cleanup)

const fixArticle = (over: Partial<ArticleMetadata> = {}): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '/hero.jpg', alt: 'a hero', lqip: '' },
    tags: ['cdk', 'maths'],
    keywords: [],
    readTime: '10 min read',
    indexPath: '',
    articleDir: '13-lambda-recursion',
    publishedDate: '2025-08-01T00:00:00.000Z',
    editedDate: '2025-08-01T00:00:00.000Z',
    title: 'Stop writing recursive Lambdas.',
    blurb:
      'A 10-minute tour of why a function that calls itself is the wrong shape for a serverless runtime.',
    ...over,
  }) as ArticleMetadata

const fixAuthor: Author = {
  username: 'kochie',
  fullName: 'Robert Koch',
  email: '',
  socialMedia: [],
  avatar: { src: '', lqip: '' },
  bio: '',
  fediverse: { creator: '' },
}

describe('HeroFeature', () => {
  it('renders the headline, deck, and read-the-essay CTA', () => {
    const { getByText, getByRole } = render(
      <HeroFeature article={fixArticle()} author={fixAuthor} />
    )
    expect(getByText('Stop writing recursive Lambdas.')).toBeTruthy()
    expect(getByText(/wrong shape for a serverless runtime/)).toBeTruthy()
    const cta = getByRole('link', { name: /read the essay/i })
    expect(cta.getAttribute('href')).toBe('/articles/13-lambda-recursion')
  })

  it('shows the article number in the kicker, padded to 2 digits', () => {
    const { container } = render(
      <HeroFeature
        article={fixArticle({ articleDir: '07-foo' })}
        author={fixAuthor}
      />
    )
    // Kicker is now `// THIS WEEK · 07 · …`; assert the number appears
    // padded with a `· 07 ·` fragment somewhere in the textContent.
    expect(container.textContent).toMatch(/·\s*07\s*·/)
  })

  it('shows the byline and read time in the meta line', () => {
    const { container } = render(
      <HeroFeature article={fixArticle()} author={fixAuthor} />
    )
    expect(container.textContent).toMatch(/Robert Koch/)
    expect(container.textContent).toMatch(/10 MIN READ/)
  })
})
