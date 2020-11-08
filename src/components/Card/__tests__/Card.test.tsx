import React from 'react'
import { create } from 'react-test-renderer'

import Card from '..'

it('renders correctly', () => {
  const tree = create(<Card />).toJSON()
  expect(tree).toMatchSnapshot()
})
