import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Heading from '@/components/Heading/title'

describe('HEADING COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Heading title={'testing'} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
