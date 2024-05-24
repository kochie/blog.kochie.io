import React from 'react'
import { render } from '@testing-library/react'
import Gallery from '@/components/Gallery'
import { ArticleMetadata } from '@/lib/article-path'
import { describe, test, expect } from 'vitest'

describe('GALLERY COMPONENT', () => {
  test('renders correctly', () => {
    const articles: ArticleMetadata[] = [
      {
        articleDir: 'test',
        title: 'Test',
        author: 'Test Author',
        blurb: 'Test Blurb',
        editedDate: '2021-01-01',
        publishedDate: '2021-01-01',
        tags: ['test'],
        keywords: ['test'],
        jumbotron: {
          url: '/test',
          alt: 'test',
          lqip: 'test',
        },
        indexPath: 'test',
        path: 'test',
        readTime: 'test',
      },
    ]

    const { asFragment } = render(<Gallery articles={articles} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
