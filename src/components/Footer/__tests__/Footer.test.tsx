import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import Footer from '@/components/Footer'

beforeAll(() => {
  library.add(faCopyright)
})

describe('FOOTER COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(
        <Footer
          title={'testTitle'}
          links={[{ src: 'link', name: 'testLink', goal: 'goal' }]}
        />
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
