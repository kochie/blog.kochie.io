import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { jest } from '@jest/globals'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', async () => {
    jest.unstable_mockModule('prism-react-renderer', () => {
      const actual = jest.requireActual(
        'prism-react-renderer'
      ) as typeof import('prism-react-renderer')
      const Highlight = actual.default
      // console.log(Highlight)

      return Object.assign(Highlight, actual)
    })

    // await import('prism-react-renderer')

    const CodeBlock = await import('@/components/CodeBlocks')

    let tree: ReactTestRenderer

    act(() => {
      tree = create(<CodeBlock.default className={'language-typescript'} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
