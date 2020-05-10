import React from 'react'
import renderer from 'react-test-renderer'

import Footer from '..'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Footer title={'testTitle'} links={[{ src: 'link', name: 'testLink' }]} />
    )
    .toJSON()
  expect(tree).toMatchSnapshot()
})
