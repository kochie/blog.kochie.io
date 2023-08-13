import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import Simulation from '@/components/Canvasses/ring-spinner'
// import { jest } from '@jest/globals'

// jest.createMockFromModule('d3')

describe('THEME COMPONENT', () => {
  test('should render', async () => {
    let tree: ReactTestRenderer

    // jest.mock('d3', () => ({
    //   axisBottom: jest.fn(),
    //   axisLeft: jest.fn(),
    //   line: jest.fn(),
    //   range: jest.fn(),
    //   scaleLinear: jest.fn(),
    //   select: jest.fn(),
    // }))

    // const d3 = require('d3')
    // console.log("D3", d3)

    // jest.mock('d3', () => d3);

    // const Simulation = (await import('@/components/Canvasses/ring-spinner')).default

    act(() => {
      tree = create(<Simulation />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
