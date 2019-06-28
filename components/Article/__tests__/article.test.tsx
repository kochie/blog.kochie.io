import * as React from 'react'
import * as renderer from 'react-test-renderer'

import Article from '../article'
// import { article } from 'articles.json';

const testArticle = {
  title: 'title',
  author: 'author',
  blurb: 'blurb',
  jumbotron: {
    src: 'source',
    lqip: 'lqip',
    alt: 'alt text',
  },
  articleFile: 'articleFile',
  readTime: 1,
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-27T10:59:18.365Z',
}

it('renders correctly', () => {
  const tree = renderer.create(<Article {...testArticle} />).toJSON()
  expect(tree).toMatchSnapshot()
})
