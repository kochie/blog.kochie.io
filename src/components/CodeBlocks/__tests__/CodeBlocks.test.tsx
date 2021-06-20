import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import CodeBlock from '@/components/CodeBlocks'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<CodeBlock className={'language-typescript'} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
