import React from 'react'
import TopBar from '@/components/Topbar'
import { describe, test, expect, afterEach, beforeAll, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCircle,
  faCogs,
  faLightbulbOn,
  faLightbulbSlash,
} from '@fortawesome/pro-duotone-svg-icons'

describe('TOPBAR COMPONENT', () => {
  afterEach(() => cleanup())

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

  test('should render', () => {
    const { asFragment } = render(<TopBar />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('links should be correct', () => {
    render(<TopBar />)
    expect(screen.getByRole('link', { name: 'Authors' })).toBeDefined()
    expect(
      screen.getByRole('link', { name: 'Authors' }).getAttribute('href')
    ).toBe('/authors')

    expect(screen.getByRole('link', { name: 'Articles' })).toBeDefined()
    expect(
      screen.getByRole('link', { name: 'Articles' }).getAttribute('href')
    ).toBe('/')

    expect(screen.getByRole('link', { name: 'Tags' })).toBeDefined()
    expect(
      screen.getByRole('link', { name: 'Tags' }).getAttribute('href')
    ).toBe('/tags')
  })
})
