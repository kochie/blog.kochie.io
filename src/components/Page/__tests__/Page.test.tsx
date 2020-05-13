import React from 'react'
import renderer from 'react-test-renderer'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import Page from '..'

beforeAll(() => {
  library.add(faCopyright)
})

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
