import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import Page from '..'

beforeAll(() => {
  library.add(faCopyright)
})

describe('PAGE COMPONENT', () => {
  test('renders correctly', () => {
    let root: ReactTestRenderer

    act(() => {
      root = create(
        <Page>
          <div>
            <p>This is a test page</p>
          </div>
        </Page>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(root.toJSON()).toMatchSnapshot()
  })
})
