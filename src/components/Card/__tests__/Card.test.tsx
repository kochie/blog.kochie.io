import React from 'react'

import Card from '@/components/Card'
import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

describe('CARD COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<Card>Test</Card>)

    expect(asFragment()).toMatchSnapshot()
  })
})
