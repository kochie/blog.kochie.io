import React from 'react'

import Quote from '..'

import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('Quote Component', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Quote
        author="test"
        position="test-position"
        src="https://pbs.twimg.com/profile_images/1561629357692465152/7PCEt4on_400x400.jpg"
      >
        A quote
      </Quote>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
