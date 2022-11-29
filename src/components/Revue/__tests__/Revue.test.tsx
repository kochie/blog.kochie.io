import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Revue from '..'

describe('Revue Component', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Revue />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
