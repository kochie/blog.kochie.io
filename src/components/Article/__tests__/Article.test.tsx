import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Article, { AuthorLink } from '@/components/Article'


const testArticle = {
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

const testAuthor = {
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

describe('AUTHORLINK COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<AuthorLink username={'username'} fullname={'fullname'} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
