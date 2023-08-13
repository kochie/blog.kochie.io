import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { describe, test, expect } from 'vitest'

import { Tag, TagSet } from '..'
import { render } from '@testing-library/react'

describe('TAG COMPONENT', () => {
  test('should render', () => {
    const { asFragment } = render(<Tag name={'tagName'} link={'tagLink'} />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('TAGSET COMPONENT', () => {
  test('should render', () => {
    const { asFragment } = render(
      <TagSet>
        <Tag name={'tagName'} link={'tagLink'} />
      </TagSet>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
