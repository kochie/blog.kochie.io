import React from 'react'
import { create } from 'react-test-renderer'

import Image from '../image-v2'

it('renders correctly', () => {
  const tree = create(<Image lqip={'lqip'} src={'source'} />).toJSON()
  expect(tree).toMatchSnapshot()
})
