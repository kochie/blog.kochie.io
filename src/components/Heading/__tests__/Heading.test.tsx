import React from 'react'
import renderer from 'react-test-renderer'

import Heading from '..'

it('renders correctly', () => {
  const tree = renderer.create(<Heading title={'testing'} />).toJSON()
  expect(tree).toMatchSnapshot()
})
