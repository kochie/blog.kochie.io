import React from 'react'
import renderer from 'react-test-renderer'

import Gallery from '..'

it('renders correctly', () => {
  const tree = renderer.create(<Gallery articles={[]} />).toJSON()
  expect(tree).toMatchSnapshot()
})
