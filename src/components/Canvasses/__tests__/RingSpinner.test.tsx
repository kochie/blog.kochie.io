import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import Simulation from '@/components/Canvasses/ring-spinner'
// import { jest } from '@jest/globals'

// jest.createMockFromModule('d3')

describe('THEME COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Simulation />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
