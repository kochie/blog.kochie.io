import React from 'react'
import { create } from 'react-test-renderer'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import Footer from '..'

beforeAll(() => {
  library.add(faCopyright)
})

it('renders correctly', () => {
  const tree = create(
    <Footer
      title={'testTitle'}
      links={[{ src: 'link', name: 'testLink', goal: 'goal' }]}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
