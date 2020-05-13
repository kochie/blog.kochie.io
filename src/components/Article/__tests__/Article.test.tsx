import React from 'react'
import renderer from 'react-test-renderer'
// eslint-disable-next-line import/named
import { IconProp } from '@fortawesome/fontawesome-svg-core'

import Article from '..'

// eslint-disable-next-line import/no-unresolved
import { Article as ArticleDetails } from 'articles.json'
// eslint-disable-next-line import/no-unresolved
import { Author as AuthorDetails } from 'authors.json'

const testArticle: ArticleDetails = {
  title: 'title',
  author: 'author',
  blurb: 'blurb',
  jumbotron: {
    src: 'source',
    url: 'test',
    lqip: 'lqip',
    alt: 'alt text',
  },
  articleDir: 'articleDir',
  readTime: 1,
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-27T10:59:18.365Z',
}

const icon: IconProp = 'accessible-icon'

const testAuthor: AuthorDetails = {
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

const jumbotron: Image = {
  url: 'string',
  lqip: 'lqip',
  palette: [],
}

const TestArticle = (
  <div>
    <p>This is a test article</p>
  </div>
)

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Article article={testArticle} author={testAuthor} jumbotron={jumbotron}>
        {TestArticle}
      </Article>
    )
    .toJSON()
  expect(tree).toMatchSnapshot()
})
