import React from 'react'
import { create } from 'react-test-renderer'
import { CardDetails, MediumCard, LargeCard, SmallCard } from '..'

const cardDetails: CardDetails = {
  title: 'title',
  image: {
    lqip: 'AAAAAAAAAAAA',
    url: 'https://blog.kochie.io/test.webp',
    src: 'src',
    alt: 'alt',
  },
  blurb: 'the blurb',
  readTime: 1,
  tags: ['tag1'],
  articleDir: 'articleDir',
}

describe('article cards', () => {
  it('renders correctly Small', () => {
    const tree = create(<SmallCard {...cardDetails} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly Medium', () => {
    const tree = create(<MediumCard {...cardDetails} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly Large', () => {
    const tree = create(<LargeCard {...cardDetails} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
