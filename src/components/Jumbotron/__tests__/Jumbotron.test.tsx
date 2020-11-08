import React from 'react'
import { create } from 'react-test-renderer'

import Jumbotron from '..'

it('renders correctly', () => {
  const tree = create(
    <Jumbotron
      background={<div />}
      foreground={<div />}
      width={'100%'}
      height={'100%'}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
