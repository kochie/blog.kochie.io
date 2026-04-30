import { describe, it, expect } from 'vitest'
import {
  getArticleNumber,
  shouldShowUpdatedDate,
  findPrevNextArticles,
} from '../article-path'
import type { ArticleMetadata } from '../article-path'

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

describe('getArticleNumber', () => {
  it('extracts the leading numeric prefix from articleDir', () => {
    expect(getArticleNumber('13-lambda-recursion')).toBe(13)
    expect(getArticleNumber('01-halo-physics')).toBe(1)
    expect(getArticleNumber('100-future')).toBe(100)
  })

  it('returns null when articleDir does not start with digits', () => {
    expect(getArticleNumber('article-blueprint')).toBeNull()
    expect(getArticleNumber('')).toBeNull()
  })
})

describe('shouldShowUpdatedDate', () => {
  it('returns false when edited matches published', () => {
    expect(
      shouldShowUpdatedDate(
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z'
      )
    ).toBe(false)
  })

  it('returns false when edited is fewer than 14 days after published', () => {
    expect(
      shouldShowUpdatedDate(
        '2025-01-01T00:00:00.000Z',
        '2025-01-13T00:00:00.000Z'
      )
    ).toBe(false)
  })

  it('returns true when edited is 14 or more days after published', () => {
    expect(
      shouldShowUpdatedDate(
        '2025-01-01T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z'
      )
    ).toBe(true)
    expect(
      shouldShowUpdatedDate(
        '2025-01-01T00:00:00.000Z',
        '2025-04-30T00:00:00.000Z'
      )
    ).toBe(true)
  })
})

describe('findPrevNextArticles', () => {
  // List sorted by publishedDate DESC: index 0 is newest, index N is oldest.
  // "prev" = next-newer (lower index); "next" = next-older (higher index).
  const list = [
    fix({ articleDir: '13-third', title: 'Third' }),
    fix({ articleDir: '12-second', title: 'Second' }),
    fix({ articleDir: '11-first', title: 'First' }),
  ]

  it('returns prev=null and next=second for the newest article', () => {
    const result = findPrevNextArticles(list, '13-third')
    expect(result.prev).toBeNull()
    expect(result.next?.articleDir).toBe('12-second')
  })

  it('returns prev=third and next=first for the middle article', () => {
    const result = findPrevNextArticles(list, '12-second')
    expect(result.prev?.articleDir).toBe('13-third')
    expect(result.next?.articleDir).toBe('11-first')
  })

  it('returns prev=second and next=null for the oldest article', () => {
    const result = findPrevNextArticles(list, '11-first')
    expect(result.prev?.articleDir).toBe('12-second')
    expect(result.next).toBeNull()
  })

  it('returns both null when the article is not in the list', () => {
    const result = findPrevNextArticles(list, 'nonexistent')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })
})
