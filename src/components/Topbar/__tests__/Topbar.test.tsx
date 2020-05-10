import React from 'react'
import renderer from 'react-test-renderer'

import TopBar from '..'

it('should render TopBar', () => {
  const tree = renderer.create(<TopBar />).toJSON()
  expect(tree).toMatchSnapshot()
})
