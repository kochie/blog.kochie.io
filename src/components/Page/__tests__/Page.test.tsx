import React from 'react'
import renderer from 'react-test-renderer'

import Page from '..'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Page>
        <div>
          <p>This is a test page</p>
        </div>
      </Page>
    )
    .toJSON()
  expect(tree).toMatchSnapshot()
})
