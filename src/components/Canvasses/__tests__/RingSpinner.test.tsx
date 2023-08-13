import React from 'react'
import Simulation from '@/components/Canvasses/ring-spinner'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('THEME COMPONENT', () => {
  test('should render', async () => {
    const { asFragment } = render(<Simulation />)

    expect(asFragment()).toMatchSnapshot()
  })
})
