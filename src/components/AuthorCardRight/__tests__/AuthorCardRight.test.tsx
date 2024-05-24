import {
  IconName,
  IconPrefix,
  library,
} from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React from 'react'
import { render } from '@testing-library/react'
import { describe, beforeAll, test, expect } from 'vitest'

import AuthorCardRight from '..'

describe('Social Media Button Component', () => {
  beforeAll(() => {
    library.add(faTwitter)
  })

  test('renders correctly - right', () => {
    const sm = {
      name: 'Twitter',
      link: 'https://twitter.com',
      icon: ['fab', 'twitter'] as [IconPrefix, IconName],
      color: '#1DA1F2',
      tracking: 'TEST',
    }

    const author = {
      username: 'test',
      fullName: 'test',
      email: 'test',
      avatar: {
        src: 'test',
        lqip: 'test',
      },
      bio: 'test',
      socialMedia: [sm],
    }

    const { asFragment } = render(<AuthorCardRight author={author} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
