import React from 'react'
import { describe, test, expect } from 'vitest'

import Heading from '@/components/Heading/title'
import { render } from '@testing-library/react'

describe('HEADING COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<Heading title={'testing'} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
