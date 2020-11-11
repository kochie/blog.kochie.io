import React from 'react'
import { create } from 'react-test-renderer'

import { CodeBlock, calculateLinesToHighlight } from '..'

it('renders correctly', () => {
  const tree = create(<CodeBlock className={'language-typescript'} />).toJSON()
  expect(tree).toMatchSnapshot()
})

describe('calculateLinesToHighlight', () => {
  it('calculates the correct number', () => {
    const tag = `jsx{1}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeTruthy()
  })

  it('calculates the correct pair of numbers', () => {
    const tag = `jsx{2,4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeFalsy()
    expect(valid(3)).toBeTruthy()
  })

  it('calculates the correct range', () => {
    const tag = `jsx{2-4}`
    const valid = calculateLinesToHighlight(tag)
    expect(valid(0)).toBeFalsy()
    expect(valid(1)).toBeTruthy()
    expect(valid(2)).toBeTruthy()
    expect(valid(3)).toBeTruthy()
  })
})
