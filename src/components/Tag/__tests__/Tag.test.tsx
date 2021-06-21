import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import { Tag, TagSet } from '..'

describe('TAG COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Tag name={'tagName'} link={'tagLink'} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('TAGSET COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(
        <TagSet>
          <Tag name={'tagName'} link={'tagLink'} />
        </TagSet>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
