import React from 'react'
import { render, screen } from '@testing-library/react'
import Article from '@/components/Article'
import { ArticleMetadata } from '@/lib/article-path'
import { expect, test, describe } from 'vitest'
import { Author } from 'types/metadata'

const testArticle: ArticleMetadata = {
  title: 'Test Article Title',
  author: 'author',
  blurb: 'A short description of the test article.',
  jumbotron: {
    url: '/test.png',
    alt: 'alt text',
    lqip: 'AAAAAAAAAAAA',
  },
  keywords: ['some', 'keywords'],
  articleDir: '13-test-article',
  readTime: '1 min read',
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-28T10:59:18.365Z',
  indexPath: '',
  path: '',
}

const testAuthor: Author = {
  username: 'testuser',
  fullName: 'Test Author',
  email: 'test@example.com',
  socialMedia: [
    {
      name: 'string',
      link: 'string',
      icon: ['fab', 'accessible-icon'],
      color: 'string',
      tracking: 'tracking',
    },
  ],
  avatar: {
    src: 'string',
    lqip: 'AAAAAAAAAAAA',
  },
  bio: 'string',
}

const TestArticle = (
  <div>
    <p>This is a test article</p>
  </div>
)

describe('ARTICLE COMPONENT', () => {
  test('renders the article title', () => {
    const { unmount } = render(
      <Article article={testArticle} author={testAuthor} prev={null} next={null}>
        {TestArticle}
      </Article>
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      testArticle.title
    )
    unmount()
  })

  test('renders the kicker article number', () => {
    const { unmount } = render(
      <Article article={testArticle} author={testAuthor} prev={null} next={null}>
        {TestArticle}
      </Article>
    )
    // articleDir is '13-test-article', kicker span has text '// ' + '13'
    const kickerSpan = document.querySelector('.text-accent.mr-2')
    expect(kickerSpan?.textContent).toMatch(/\/\/\s*13/)
    unmount()
  })

  test('renders the deck (blurb)', () => {
    const { unmount } = render(
      <Article article={testArticle} author={testAuthor} prev={null} next={null}>
        {TestArticle}
      </Article>
    )
    expect(screen.getByText(testArticle.blurb)).toBeTruthy()
    unmount()
  })

  test('renders the byline', () => {
    const { unmount } = render(
      <Article article={testArticle} author={testAuthor} prev={null} next={null}>
        {TestArticle}
      </Article>
    )
    // The byline span contains 'By ' + author.fullName as separate text nodes
    const bylineSpan = document.querySelector('.font-serif.italic.text-text')
    expect(bylineSpan?.textContent).toContain(testAuthor.fullName)
    unmount()
  })
})
