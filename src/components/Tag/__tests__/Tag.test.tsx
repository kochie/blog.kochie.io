import React from 'react'
import { describe, test, expect } from 'vitest'

import { Tag, TagSet } from '..'
import { render } from '@testing-library/react'

describe('TAG COMPONENT', () => {
  test('should render', () => {
    const { asFragment } = render(<Tag name={'tagName'} link={'tagLink'} />)

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders inverted variant', () => {
    const { asFragment } = render(
      <Tag name="night" link="/tags/night" inverted />
    )
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

  test('merges custom className with tagSet styles', () => {
    const { asFragment } = render(
      <TagSet className="flex gap-2">
        <Tag name="a" link="/tags/a" />
        <Tag name="b" link="/tags/b" />
      </TagSet>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
