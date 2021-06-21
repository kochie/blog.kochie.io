import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

import Theme from '@/components/Theme'
import { ThemeProvider } from '@/components/Theme/context'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faLightbulbOn,
  faLightbulbSlash,
} from '@fortawesome/pro-duotone-svg-icons'

beforeAll(() => {
  library.add(faLightbulbSlash, faLightbulbOn)

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

describe('THEME COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Theme />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('THEMEPROVIDER COMPONENT', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<ThemeProvider />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
