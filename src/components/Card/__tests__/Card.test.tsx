import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Card from '@/components/Card'

describe('CARD COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Card>Test</Card>)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
