import React from 'react'
import { create } from 'react-test-renderer'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

import Article, { AuthorLink } from '..'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

const testArticle = {
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
  },
  bio: 'string',
}

describe('Article', () => {
  it('renders correctly', async () => {
    const source = await serialize('<div/>')
    const tree = create(
      <Article article={testArticle} author={testAuthor}>
        <MDXRemote components={{}} {...source} />
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
