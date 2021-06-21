import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import Gallery from '@/components/Gallery'

describe('GALLERY COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Gallery articles={[]} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
