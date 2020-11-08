import React from 'react'
import { create } from 'react-test-renderer'

import { CodeBlock } from '..'

it('renders correctly', () => {
  const tree = create(<CodeBlock className={'language-typescript'} />).toJSON()
  expect(tree).toMatchSnapshot()
})
