/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ChapterPager from '../index'
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
    publishedDate: '',
    editedDate: '',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

const member = (chapter: number, over: Partial<ArticleMetadata>): ProjectMember => ({
  article: article(over),
  chapter,
})

describe('ChapterPager', () => {
  it('renders previous and next chapter cards on a middle chapter', () => {
    const { container } = render(
      <ChapterPager
        projectSlug="foundry"
        projectTitle="The Foundry"
        prev={member(3, { articleDir: 'c3', title: 'Crucible' })}
        next={member(5, { articleDir: 'c5', title: 'Bracelet' })}
      />
    )
    expect(container.textContent).toMatch(/PREVIOUS CHAPTER/)
    expect(container.textContent).toMatch(/NEXT CHAPTER/)
    expect(container.textContent).toMatch(/Crucible/)
    expect(container.textContent).toMatch(/Bracelet/)
    expect(container.querySelector('a[href="/articles/c3"]')).not.toBeNull()
    expect(container.querySelector('a[href="/articles/c5"]')).not.toBeNull()
  })

  it('renders a VIEW PROJECT card on the previous side when prev is null', () => {
    const { container } = render(
      <ChapterPager
        projectSlug="foundry"
        projectTitle="The Foundry"
        prev={null}
        next={member(2, { articleDir: 'c2', title: 'Burner' })}
      />
    )
    expect(container.textContent).toMatch(/VIEW PROJECT/)
    expect(container.querySelector('a[href="/projects/foundry"]')).not.toBeNull()
    expect(container.querySelector('a[href="/articles/c2"]')).not.toBeNull()
  })

  it('renders a VIEW PROJECT card on the next side when next is null', () => {
    const { container } = render(
      <ChapterPager
        projectSlug="foundry"
        projectTitle="The Foundry"
        prev={member(3, { articleDir: 'c3', title: 'Crucible' })}
        next={null}
      />
    )
    expect(container.textContent).toMatch(/VIEW PROJECT/)
    expect(container.querySelector('a[href="/articles/c3"]')).not.toBeNull()
    expect(container.querySelector('a[href="/projects/foundry"]')).not.toBeNull()
  })

  it('renders both sides as VIEW PROJECT for a single-chapter project', () => {
    const { container } = render(
      <ChapterPager
        projectSlug="foundry"
        projectTitle="The Foundry"
        prev={null}
        next={null}
      />
    )
    const projectLinks = container.querySelectorAll(
      'a[href="/projects/foundry"]'
    )
    expect(projectLinks.length).toBe(2)
  })

  it('formats chapter labels with leading zero', () => {
    const { container } = render(
      <ChapterPager
        projectSlug="foundry"
        projectTitle="The Foundry"
        prev={member(2, { articleDir: 'c2', title: 'Burner' })}
        next={member(4, { articleDir: 'c4', title: 'Pour' })}
      />
    )
    expect(container.textContent).toMatch(/CH\.02/)
    expect(container.textContent).toMatch(/CH\.04/)
  })
})
