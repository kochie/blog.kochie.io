import React from 'react'
import { create } from 'react-test-renderer'

import Heading from '..'

it('renders correctly', () => {
  const tree = create(<Heading title={'testing'} />).toJSON()
  expect(tree).toMatchSnapshot()
})
