import React from 'react'
import renderer from 'react-test-renderer'

import { Tag, TagSet } from '..'

it('should render Tag', () => {
  const tree = renderer
    .create(<Tag name={'tagName'} link={'tagLink'} />)
    .toJSON()
  expect(tree).toMatchSnapshot()
})

it('should render TagSet', () => {
  const tree = renderer.create(<TagSet></TagSet>).toJSON()
  expect(tree).toMatchSnapshot()
})
