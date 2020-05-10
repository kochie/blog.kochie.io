import React from 'react'
import renderer from 'react-test-renderer'
import { SmallCard, CardDetails, LargeCard, MediumCard } from '..'

const cardDetails: CardDetails = {
  title: 'title',
  image: {
    lqip: 'lqip',
    url: 'url',
    src: 'src',
    alt: 'alt',
  },
  blurb: 'the blurb',
  readTime: 1,
  tags: ['tag1'],
  articleDir: 'articleDir',
}

it('renders correctly Small', () => {
  const tree = renderer.create(<SmallCard {...cardDetails} />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly Medium', () => {
  const tree = renderer.create(<MediumCard {...cardDetails} />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly Large', () => {
  const tree = renderer.create(<LargeCard {...cardDetails} />).toJSON()
  expect(tree).toMatchSnapshot()
})
