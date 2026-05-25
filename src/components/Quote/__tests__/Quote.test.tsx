import React from 'react'

import Quote from '..'

import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('Quote Component', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <Quote
        author="test"
        position="test-position"
        src="https://pbs.twimg.com/profile_images/1561629357692465152/7PCEt4on_400x400.jpg"
      >
        A quote
      </Quote>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('defaults to the wide tier', () => {
    const { container } = render(<Quote>A quote</Quote>)
    // The middle wrapper carries the max-width class — wide is the default.
    const widthWrapper = container.querySelector('.max-w-wide')
    expect(widthWrapper).not.toBeNull()
    expect(container.querySelector('.max-w-prose')).toBeNull()
    expect(container.querySelector('.max-w-bleed')).toBeNull()
  })

  test('uses prose width when tier="prose" is passed', () => {
    const { container } = render(<Quote tier="prose">A quote</Quote>)
    expect(container.querySelector('.max-w-prose')).not.toBeNull()
    expect(container.querySelector('.max-w-wide')).toBeNull()
  })

  test('applies the bleed breakout pattern when tier="bleed"', () => {
    // Bleed tier needs the same viewport-breakout as bleed figures so it
    // escapes the article's content column.
    const { container } = render(<Quote tier="bleed">A quote</Quote>)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toMatch(/xl:w-screen/)
    expect(root.className).toMatch(/xl:-translate-x-1\/2/)
    const inner = root.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-bleed/)
    expect(inner?.className).toMatch(/px-4/)
  })

  test('keeps the signal-yellow left stripe regardless of tier', () => {
    // The pull-quote's identity is the signal stripe — it must survive the
    // tier-driven wrapper restructure.
    for (const tier of ['prose', 'wide', 'bleed'] as const) {
      const { container, unmount } = render(<Quote tier={tier}>x</Quote>)
      expect(
        container.querySelector('.border-l-2.border-signal')
      ).not.toBeNull()
      unmount()
    }
  })
})
