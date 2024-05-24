import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import React from 'react'
import { describe, test, expect } from 'vitest'

import SMButton from '..'
import { render } from '@testing-library/react'

describe('Social Media Button Component', () => {
  test('renders correctly', () => {
    const props = {
      name: 'Twitter',
      link: 'https://twitter.com',
      icon: ['fab', 'twitter'] as [IconPrefix, IconName],
      color: '#1DA1F2',
      tracking: 'TEST',
    }

    const { asFragment } = render(<SMButton sm={props} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
