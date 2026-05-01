/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ChapterTimeline from '../index'
import type { ProjectMember } from '@/lib/project-path'
import type { ArticleMetadata } from '@/lib/article-path'

afterEach(cleanup)

const article = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '3 min read',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

const member = (chapter: number, over: Partial<ArticleMetadata>): ProjectMember => ({
  article: article(over),
  chapter,
})

describe('ChapterTimeline', () => {
  it('renders one row per member with the chapter number CH.NN', () => {
    const { container } = render(
      <ChapterTimeline
        members={[
          member(1, { articleDir: 'a', title: 'First' }),
          member(2, { articleDir: 'b', title: 'Second' }),
        ]}
      />
    )
    expect(container.textContent).toMatch(/CH\.01/)
    expect(container.textContent).toMatch(/CH\.02/)
    expect(container.textContent).toMatch(/First/)
    expect(container.textContent).toMatch(/Second/)
  })

  it('links each chapter to its article', () => {
    const { container } = render(
      <ChapterTimeline
        members={[member(1, { articleDir: 'a', title: 'First' })]}
      />
    )
    expect(container.querySelector('a[href="/articles/a"]')).not.toBeNull()
  })

  it('renders an empty-state message when there are no members', () => {
    const { container } = render(<ChapterTimeline members={[]} />)
    expect(container.textContent?.toLowerCase()).toContain('no chapters')
  })

  it('shows the read time for each chapter', () => {
    const { container } = render(
      <ChapterTimeline
        members={[
          member(1, {
            articleDir: 'a',
            title: 'First',
            readTime: '4 min read',
          }),
        ]}
      />
    )
    expect(container.textContent?.toUpperCase()).toContain('4 MIN READ')
  })
})
