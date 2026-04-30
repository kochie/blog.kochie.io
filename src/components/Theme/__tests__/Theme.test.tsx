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
      addListener: vi.fn(),
      removeListener: vi.fn(),
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
    document.documentElement.removeAttribute('data-theme')
  })

  test('mounts with dark default and sets data-theme + body.dark', async () => {
    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>
    )

    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    )
    expect(document.body.classList.contains('dark')).toBe(true)
    // Without a stored preference, mounting should NOT write to localStorage.
    expect(localStorage.getItem('theme')).toBeNull()
  })

  test('cycle button advances dark → light → system → dark and syncs state', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>
    )

    // Wait for initial dark theme to be applied to the DOM before interacting.
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    )

    const cycle = () =>
      fireEvent.click(
        container.querySelector('[aria-label="Change Theme"]') as HTMLElement
      )

    // dark → light
    cycle()
    await waitFor(() => expect(localStorage.getItem('theme')).toBe(THEME.light))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.body.classList.contains('dark')).toBe(false)

    // light → system. matchMedia mock returns false for any query, so
    // (prefers-color-scheme: light) does not match → system resolves to dark.
    cycle()
    await waitFor(() =>
      expect(localStorage.getItem('theme')).toBe(THEME.system)
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.body.classList.contains('dark')).toBe(true)

    // system → dark
    cycle()
    await waitFor(() => expect(localStorage.getItem('theme')).toBe(THEME.dark))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.body.classList.contains('dark')).toBe(true)
  })

  test('respects a stored preference set before mount (does not clobber localStorage)', async () => {
    // Simulate a returning user who previously chose light mode.
    localStorage.setItem('theme', THEME.light)

    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>
    )

    await waitFor(() => expect(localStorage.getItem('theme')).toBe(THEME.light))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.body.classList.contains('dark')).toBe(false)
  })
})
