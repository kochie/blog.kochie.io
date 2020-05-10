import React from 'react'
import renderer from 'react-test-renderer'

import Image from '../image-v2'

it('renders correctly', () => {
  const tree = renderer.create(<Image lqip={'lqip'} src={'source'} />).toJSON()
  expect(tree).toMatchSnapshot()
})
