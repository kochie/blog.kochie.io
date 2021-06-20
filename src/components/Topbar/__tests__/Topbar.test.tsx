import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import TopBar from '@/components/Topbar'

describe('TOPBAR COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<TopBar />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
