import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Loading from '@/components/Loading'

describe('LOADING COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Loading />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
