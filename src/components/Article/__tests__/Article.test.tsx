import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Article from '@/components/Article'
import { ArticleMetadata } from 'src/lib/article-path'

import type { Author } from 'metadata.yaml'

const testArticle: ArticleMetadata = {
  title: 'title',
  author: 'author',
  blurb: 'blurb',
  jumbotron: {
    url: '/test.png',
    alt: 'alt text',
    lqip: 'AAAAAAAAAAAA',
  },
  articleDir: 'articleDir',
  readTime: '1 min read',
  tags: ['some', 'tags'],
  publishedDate: '2019-06-27T10:59:18.365Z',
  editedDate: '2019-06-28T10:59:18.365Z',
  indexPath: '',
  path: '',
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
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(
        <Article article={testArticle} author={testAuthor}>
          {TestArticle}
        </Article>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
