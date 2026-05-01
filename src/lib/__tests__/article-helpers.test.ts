import { describe, it, expect } from 'vitest'
import {
  getArticleNumber,
  shouldShowUpdatedDate,
  findSimilarArticles,
  getUsedTags,
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

describe('findSimilarArticles', () => {
  const all = [
    fix({
      articleDir: '01-alpha',
      title: 'Alpha',
      tags: ['gaming', 'physics'],
      publishedDate: '2025-01-01T00:00:00.000Z',
    }),
    fix({
      articleDir: '02-beta',
      title: 'Beta',
      tags: ['gaming', 'physics', 'maths'],
      publishedDate: '2025-02-01T00:00:00.000Z',
    }),
    fix({
      articleDir: '03-gamma',
      title: 'Gamma',
      tags: ['gaming'],
      publishedDate: '2025-03-01T00:00:00.000Z',
    }),
    fix({
      articleDir: '04-delta',
      title: 'Delta',
      tags: ['cooking'],
      publishedDate: '2025-04-01T00:00:00.000Z',
    }),
  ]

  it('honours an explicit similar list, then tops up with the latest essays', () => {
    // The frontmatter only names two essays, but the article foot wants
    // three cards — so 02-beta (the latest leftover) gets appended.
    const current = fix({
      articleDir: '01-alpha',
      tags: ['gaming'],
      similar: ['04-delta', '03-gamma'],
    })
    const result = findSimilarArticles(current, all, 3)
    expect(result.map((a) => a.articleDir)).toEqual([
      '04-delta',
      '03-gamma',
      '02-beta',
    ])
  })

  it('skips unknown slugs in the explicit list silently and pads with the latest', () => {
    const current = fix({
      articleDir: '01-alpha',
      tags: [],
      similar: ['does-not-exist', '02-beta'],
    })
    const result = findSimilarArticles(current, all, 3)
    // 02-beta lands first from the explicit list, then 04-delta (newest
    // remaining) and 03-gamma fill the slot.
    expect(result.map((a) => a.articleDir)).toEqual([
      '02-beta',
      '04-delta',
      '03-gamma',
    ])
  })

  it('falls back to tag overlap, ranked by overlap then publishedDate desc', () => {
    const current = fix({
      articleDir: '01-alpha',
      tags: ['gaming', 'physics'],
    })
    const result = findSimilarArticles(current, all, 3)
    // 02-beta shares 2 tags (highest), 03-gamma shares 1, 04-delta shares
    // 0 — but it gets pulled in by the latest-essays top-up.
    expect(result.map((a) => a.articleDir)).toEqual([
      '02-beta',
      '03-gamma',
      '04-delta',
    ])
  })

  it('respects the limit parameter', () => {
    const current = fix({ articleDir: 'x', tags: ['gaming'] })
    const result = findSimilarArticles(current, all, 2)
    expect(result.length).toBe(2)
  })

  it('tops up with the latest essays when nothing tag-overlaps', () => {
    // No overlap and no explicit similar list — every card comes from the
    // latest-essays fallback, sorted publishedDate desc.
    const current = fix({ articleDir: 'x', tags: ['unrelated'] })
    const result = findSimilarArticles(current, all, 3)
    expect(result.map((a) => a.articleDir)).toEqual([
      '04-delta',
      '03-gamma',
      '02-beta',
    ])
  })

  it('returns an empty array when the archive has no other articles', () => {
    // Single-essay archive — the current article is the only one, nothing
    // to suggest.
    const lone = fix({ articleDir: 'only', tags: ['gaming'] })
    expect(findSimilarArticles(lone, [lone], 3)).toEqual([])
  })

  it('returns fewer than the limit when the pool is smaller than the limit', () => {
    // Two-essay archive with limit=3 — the function should hand back what
    // it has, not loop.
    const current = fix({ articleDir: '01-alpha', tags: ['gaming'] })
    const tiny = [current, all[1]]
    const result = findSimilarArticles(current, tiny, 3)
    expect(result.map((a) => a.articleDir)).toEqual(['02-beta'])
  })

  it('always excludes the current article', () => {
    const current = fix({
      articleDir: '02-beta',
      tags: ['gaming', 'physics', 'maths'],
    })
    const result = findSimilarArticles(current, all, 5)
    expect(result.map((a) => a.articleDir)).not.toContain('02-beta')
  })

  it('does not duplicate an article between the explicit list and the top-up', () => {
    // 02-beta is explicitly named *and* is the latest other essay. It
    // should appear exactly once in the result.
    const current = fix({
      articleDir: '01-alpha',
      tags: [],
      similar: ['02-beta'],
    })
    const result = findSimilarArticles(current, all, 3)
    const slugs = result.map((a) => a.articleDir)
    const occurrences = slugs.filter((s) => s === '02-beta').length
    expect(occurrences).toBe(1)
    expect(slugs.length).toBe(3)
  })
})

describe('getUsedTags', () => {
  const meta = [
    { name: 'CDK', blurb: 'AWS Cloud Development Kit' },
    { name: 'Software', blurb: 'programming and software engineering' },
    { name: 'WebDev' },
    // A metadata-only tag — no article uses it. Must not appear in the result.
    { name: 'Foundry', blurb: 'metalworking' },
  ]

  it('joins article tags to metadata case-insensitively', () => {
    // Article tags are lowercase; metadata uses TitleCase. Without
    // case-insensitive folding, every tag would count as 0.
    const articles = [
      fix({ articleDir: 'a', tags: ['cdk', 'software'] }),
      fix({ articleDir: 'b', tags: ['software', 'webdev'] }),
    ]
    const tags = getUsedTags(articles, meta)
    const byName = new Map(tags.map((t) => [t.name, t]))
    expect(byName.get('CDK')?.articleCount).toBe(1)
    expect(byName.get('Software')?.articleCount).toBe(2)
    expect(byName.get('WebDev')?.articleCount).toBe(1)
  })

  it('uses the metadata display name (proper casing) over the article literal', () => {
    const articles = [fix({ articleDir: 'a', tags: ['cdk'] })]
    const [tag] = getUsedTags(articles, meta)
    expect(tag.name).toBe('CDK')
    expect(tag.slug).toBe('cdk')
  })

  it('falls back to the article literal when metadata has no entry', () => {
    // No meta entry for "physics" — keep the article's casing verbatim.
    const articles = [fix({ articleDir: 'a', tags: ['physics'] })]
    const [tag] = getUsedTags(articles, meta)
    expect(tag.name).toBe('physics')
    expect(tag.slug).toBe('physics')
    expect(tag.blurb).toBeUndefined()
  })

  it('omits metadata tags that no article uses', () => {
    // "Foundry" is in metadata but no article tags it. Must not appear.
    const articles = [fix({ articleDir: 'a', tags: ['cdk'] })]
    const tags = getUsedTags(articles, meta)
    expect(tags.find((t) => t.name === 'Foundry')).toBeUndefined()
  })

  it('counts an article tagged with the same name twice (different cases) only once', () => {
    // Defensive: an authoring slip that lists `Software` and `software`
    // in the same article shouldn't inflate the count.
    const articles = [fix({ articleDir: 'a', tags: ['Software', 'software'] })]
    const [tag] = getUsedTags(articles, meta)
    expect(tag.name).toBe('Software')
    expect(tag.articleCount).toBe(1)
  })

  it('always reports articleCount > 0 (no zero-count entries leak through)', () => {
    const articles = [fix({ articleDir: 'a', tags: ['cdk'] })]
    const tags = getUsedTags(articles, meta)
    expect(tags.every((t) => t.articleCount > 0)).toBe(true)
  })

  it('sorts by count descending, then alphabetical', () => {
    const articles = [
      fix({ articleDir: 'a', tags: ['software', 'webdev'] }),
      fix({ articleDir: 'b', tags: ['software', 'cdk'] }),
      fix({ articleDir: 'c', tags: ['software'] }),
    ]
    const tags = getUsedTags(articles, meta)
    // Software: 3, CDK: 1, WebDev: 1. After count desc, alphabetical.
    expect(tags.map((t) => t.name)).toEqual(['Software', 'CDK', 'WebDev'])
  })

  it('returns an empty array when there are no articles', () => {
    expect(getUsedTags([], meta)).toEqual([])
  })

  it('passes blurb and image through from metadata when present', () => {
    const metaWithImage = [
      { name: 'CDK', blurb: 'AWS', image: { src: 'cdk.png' } },
    ]
    const articles = [fix({ articleDir: 'a', tags: ['cdk'] })]
    const [tag] = getUsedTags(articles, metaWithImage)
    expect(tag.blurb).toBe('AWS')
    expect(tag.image?.src).toBe('cdk.png')
  })
})
