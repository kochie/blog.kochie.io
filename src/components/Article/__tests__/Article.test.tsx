import React from 'react'
import { render } from '@testing-library/react'
import { library } from '@fortawesome/fontawesome-svg-core'
import Article, { AuthorLink } from '@/components/Article'
import { ArticleMetadata } from '@/lib/article-path'
import { faArrowToTop } from '@fortawesome/pro-duotone-svg-icons'
import { expect, test, describe, beforeAll } from 'vitest'
import { Author } from 'types/metadata'

const testArticle: ArticleMetadata = {
  title: 'title',
  author: 'author',
  blurb: 'blurb',
  jumbotron: {
    url: '/test.png',
    alt: 'alt text',
    lqip: 'AAAAAAAAAAAA',
  },
  keywords: ['some', 'keywords'],
  articleDir: 'articleDir',
  readTime: '1 min read',
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-28T10:59:18.365Z',
  indexPath: '',
  path: '',
}

const testAuthor: Author = {
  username: 'string',
  fullName: 'string',
  email: 'string',
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

beforeAll(() => {
  library.add(faArrowToTop)
})

describe('ARTICLE COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Article article={testArticle} author={testAuthor}>
        {TestArticle}
      </Article>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('AUTHORLINK COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <AuthorLink username={'username'} fullname={'fullname'} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
