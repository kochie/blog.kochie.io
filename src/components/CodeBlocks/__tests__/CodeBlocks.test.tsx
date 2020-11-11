import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import CodeBlock, { calculateLinesToHighlight } from '@/components/CodeBlocks'

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

describe('calculateLinesToHighlight', () => {
  test('calculates the correct number', () => {
    const tag = `jsx{1}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeTruthy()
  })

  test('calculates the correct pair of numbers', () => {
    const tag = `jsx{2,4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeFalsy()
    expect(valid(3)).toBeTruthy()
  })

  test('calculates the correct range', () => {
    const tag = `jsx{2-4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeTruthy()
    expect(valid(3)).toBeTruthy()
  })
})
