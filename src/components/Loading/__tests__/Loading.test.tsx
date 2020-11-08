import React from 'react'
import { create } from 'react-test-renderer'

import Loading from '..'

it('renders correctly', () => {
  const tree = create(<Loading />).toJSON()
  expect(tree).toMatchSnapshot()
})
