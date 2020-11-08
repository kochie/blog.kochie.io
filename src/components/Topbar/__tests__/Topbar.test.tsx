import React from 'react'
import { create } from 'react-test-renderer'

import TopBar from '..'

it('should render TopBar', () => {
  const tree = create(<TopBar />).toJSON()
  expect(tree).toMatchSnapshot()
})
