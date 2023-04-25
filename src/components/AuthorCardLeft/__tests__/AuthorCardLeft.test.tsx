import {
  IconName,
  IconPrefix,
  library,
} from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import AuthorCardLeft from '..'

describe('Social Media Button Component', () => {
  beforeAll(() => {
    library.add(faTwitter)
  })

  test('renders correctly - left', () => {
    let tree: ReactTestRenderer

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

    act(() => {
      tree = create(<AuthorCardLeft author={author} />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
