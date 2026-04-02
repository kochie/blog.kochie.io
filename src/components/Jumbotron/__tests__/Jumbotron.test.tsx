import React from 'react'
import { describe, test, expect } from 'vitest'

import Jumbotron from '@/components/Jumbotron'
import { render } from '@testing-library/react'

describe('JUMBOTRON COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Jumbotron
        background={<div />}
        foreground={<div />}
        width={'100%'}
        height={'100%'}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders with numeric dimensions and content', () => {
    const { asFragment } = render(
      <Jumbotron
        background={<div data-testid="bg">BG</div>}
        foreground={<span data-testid="fg">Title</span>}
        width={960}
        height={480}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
