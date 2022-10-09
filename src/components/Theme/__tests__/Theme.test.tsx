import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { jest } from '@jest/globals'

import { ThemeButton, ThemeProvider } from '@/components/Theme'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faLightbulbOn,
  faLightbulbSlash,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

beforeAll(() => {
  library.add(faLightbulbSlash, faLightbulbOn, faCogs, faCircle)

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
      tree = create(<ThemeButton />)
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
