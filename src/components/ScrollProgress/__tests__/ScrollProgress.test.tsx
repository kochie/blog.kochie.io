/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, act } from '@testing-library/react'
import ScrollProgress from '../index'

afterEach(cleanup)

describe('ScrollProgress', () => {
  it('renders a fixed bar at the top of the viewport', () => {
    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('[data-scroll-progress]')
    expect(bar).toBeTruthy()
  })

  it('starts at 0% width and updates on scroll', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    })

    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('[data-scroll-progress]') as HTMLElement
    expect(bar.style.width).toBe('0%')

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    // 500 / (2000 - 1000) = 50%
    expect(bar.style.width).toMatch(/^50/)
  })
})
