import React from 'react'
import {
  CardDetails,
  LargeCard,
  MediumCard,
  SmallCard,
} from '@/components/ArticleCards'
import { render } from '@testing-library/react'
import { expect, describe, test, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// msw-handlers.js

// Define the handlers
export const handlers = [
  // Mock the GET request for next/image
  http.get('/_next/image', ({ request }) => {
    const url = new URL(request.url)
    const imageURL = url.searchParams.get('url')
    console.log(imageURL)

    return HttpResponse.arrayBuffer(new ArrayBuffer(0), {
      headers: {
        'response-type': 'image/jpeg',
      },
    })
  }),
]

const server = setupServer(...handlers)

const cardDetails: CardDetails = {
  title: 'title',
  image: {
    lqip: 'AAAAAAAAAAAA',
    url: '/images/og.jpg',
    alt: 'alt',
  },
  blurb: 'the blurb',
  readTime: '1 min read',
  tags: ['tag1'],
  articleDir: 'articleDir',
}

describe('ARTICLECARDS LARGE COMPONENT', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test('renderes correctly', () => {
    const { asFragment } = render(<LargeCard {...cardDetails} />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('ARTICLECARDS MEDIUM COMPONENT', () => {
  test('renderes correctly', () => {
    const { asFragment } = render(<MediumCard {...cardDetails} />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('ARTICLECARDS SMALL COMPONENT', () => {
  test('renderes correctly', () => {
    const { asFragment } = render(<SmallCard {...cardDetails} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
