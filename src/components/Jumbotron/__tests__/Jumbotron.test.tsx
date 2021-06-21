import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Jumbotron from '@/components/Jumbotron'

describe('JUMBOTRON COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(
        <Jumbotron
          background={<div />}
          foreground={<div />}
          width={'100%'}
          height={'100%'}
        />
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
