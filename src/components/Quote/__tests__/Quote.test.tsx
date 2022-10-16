import { library } from '@fortawesome/fontawesome-svg-core'
import { faQuoteLeft, faQuoteRight } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Quote from '..'

describe('Quote Component', () => {
  beforeAll(() => {
    library.add(faQuoteRight, faQuoteLeft)
  })

  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(
        <Quote author="test" position="test-position">
          A quote
        </Quote>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
