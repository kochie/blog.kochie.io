import React from 'react'
import { create } from 'react-test-renderer'

import { Tag, TagSet } from '..'

it('should render Tag', () => {
  const tree = create(<Tag name={'tagName'} link={'tagLink'} />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('should render TagSet', () => {
  const tree = create(
    <TagSet>
      <Tag name={'tagName'} link={'tagLink'} />
    </TagSet>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
