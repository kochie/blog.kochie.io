import React from 'react'
import { create } from 'react-test-renderer'
// eslint-disable-next-line import/named
import { IconProp } from '@fortawesome/fontawesome-svg-core'

import Article, { AuthorLink } from '..'


const testArticle: ArticleMetadata = {
  title: 'title',
  author: 'author',
  blurb: 'blurb',
  jumbotron: {
    url: '/test.png',
    alt: 'alt text',
  },
  articleDir: 'articleDir',
  readTime: '1 min read',
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-27T10:59:18.365Z',
  indexPath: '',
  path: ''
}

const icon: IconProp = 'accessible-icon'

const testAuthor: Author = {
  username: 'string',
  fullName: 'string',
  email: 'string',
  socialMedia: [
    {
      name: 'string',
      link: 'string',
      icon: icon,
      color: 'string',
      tracking: 'tracking',
    },
  ],
  avatar: {
    src: 'string',
  },
  bio: 'string',
}

const TestArticle = (
  <div>
    <p>This is a test article</p>
  </div>
)

describe('Article', () => {
  it('renders correctly', () => {
    const tree = create(
      <Article article={testArticle} author={testAuthor} jumbotron={jumbotron}>
        {TestArticle}
      </Article>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('AuthorLink', () => {
  it('renders correctly', () => {
    const tree = create(
      <AuthorLink username={'username'} fullname={'fullname'} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
