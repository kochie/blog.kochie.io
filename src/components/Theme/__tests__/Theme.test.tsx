import React from 'react'

import { ThemeButton, ThemeProvider } from '@/components/Theme'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faLightbulbOn,
  faLightbulbSlash,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { beforeAll, describe, test, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { THEME } from '@/components/Theme'

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

describe('ThemeButton interactions', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.className = ''
  })

  test('main control cycles system → dark → light and syncs localStorage', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>
    )

    await waitFor(() =>
      expect(localStorage.getItem('theme')).toBe(THEME.system)
    )

    const cycle = container.querySelector('[aria-label="Change Theme"]')
    expect(cycle).toBeTruthy()
    fireEvent.click(cycle as HTMLElement)

    await waitFor(() =>
      expect(localStorage.getItem('theme')).toBe(THEME.dark)
    )
    expect(document.body.classList.contains('dark')).toBe(true)

    fireEvent.click(container.querySelector('[aria-label="Change Theme"]') as HTMLElement)
    await waitFor(() =>
      expect(localStorage.getItem('theme')).toBe(THEME.light)
    )
    expect(document.body.classList.contains('dark')).toBe(false)

    fireEvent.click(container.querySelector('[aria-label="Change Theme"]') as HTMLElement)
    await waitFor(() =>
      expect(localStorage.getItem('theme')).toBe(THEME.system)
    )
  })
})
