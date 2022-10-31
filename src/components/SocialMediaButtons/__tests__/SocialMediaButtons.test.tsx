import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import SMButton from '..'

describe('Social Media Button Component', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    const props = {
      name: 'Twitter',
      link: 'https://twitter.com',
      icon: ['fab', 'twitter'] as [IconPrefix, IconName],
      color: '#1DA1F2',
      tracking: 'TEST',
    }

    act(() => {
      tree = create(<SMButton sm={props} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
