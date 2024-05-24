import React from 'react'
import { describe, test, expect } from 'vitest'

import Loading from '@/components/Loading'
import { render } from '@testing-library/react'

describe('LOADING COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<Loading />)

    expect(asFragment()).toMatchSnapshot()
  })
})
