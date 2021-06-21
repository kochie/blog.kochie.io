import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import {
  CardDetails,
  LargeCard,
  MediumCard,
  SmallCard,
} from '@/components/ArticleCards'

const cardDetails: CardDetails = {
  title: 'title',
  image: {
    lqip: 'AAAAAAAAAAAA',
    url: 'https://blog.kochie.io/test.webp',
    alt: 'alt',
  },
  blurb: 'the blurb',
  readTime: '1 min read',
  tags: ['tag1'],
  articleDir: 'articleDir',
}

describe('ARTICLECARDS LARGE COMPONENT', () => {
  test('renderes correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<LargeCard {...cardDetails} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('ARTICLECARDS MEDIUM COMPONENT', () => {
  test('renderes correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<MediumCard {...cardDetails} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('ARTICLECARDS SMALL COMPONENT', () => {
  test('renderes correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<SmallCard {...cardDetails} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
