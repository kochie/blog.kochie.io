import React from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'
import { beforeAll, describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

import Page from '..'

beforeAll(() => {
  library.add(faCopyright)
})

describe('PAGE COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Page>
        <div>
          <p>This is a test page</p>
        </div>
      </Page>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
