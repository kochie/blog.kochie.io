import React from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import Footer from '@/components/Footer'

import { beforeAll, describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

beforeAll(() => {
  library.add(faCopyright)
})

describe('FOOTER COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Footer
        title={'testTitle'}
        links={[{ src: 'link', name: 'testLink', goal: 'goal' }]}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
