import React from 'react'

import { ThemeButton, ThemeProvider } from '@/components/Theme'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faLightbulbOn,
  faLightbulbSlash,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { beforeAll, describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

beforeAll(() => {
  library.add(faLightbulbSlash, faLightbulbOn, faCogs, faCircle)

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('THEME COMPONENT', () => {
  test('should render', () => {
    const { asFragment } = render(<ThemeButton />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('THEMEPROVIDER COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<ThemeProvider />)

    expect(asFragment()).toMatchSnapshot()
  })
})
