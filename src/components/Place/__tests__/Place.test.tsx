/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import Place from '../index'

afterEach(cleanup)

describe('Place', () => {
  it('renders the place name as a link to the website', () => {
    const { getByText } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    const link = getByText('Harp and Hound').closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('does not render an instagram link when the prop is absent', () => {
    const { container } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Instagram"]')
    ).toBeNull()
  })

  it('does not render a map link when the prop is absent', () => {
    const { container } = render(
      <Place link="https://example.com">Harp and Hound</Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Maps"]')
    ).toBeNull()
  })

  it('renders an instagram icon link when instagram prop is provided', () => {
    const { container } = render(
      <Place link="https://example.com" instagram="myfoo">
        Harp and Hound
      </Place>
    )
    const link = container.querySelector(
      '[aria-label="Harp and Hound on Instagram"]'
    )
    expect(link).not.toBeNull()
    expect(link).toHaveAttribute('href', 'https://instagram.com/myfoo')
  })

  it('renders a map icon link when map prop is provided', () => {
    const { container } = render(
      <Place link="https://example.com" map="https://maps.apple.com/?q=test">
        Harp and Hound
      </Place>
    )
    const link = container.querySelector(
      '[aria-label="Harp and Hound on Maps"]'
    )
    expect(link).not.toBeNull()
    expect(link).toHaveAttribute('href', 'https://maps.apple.com/?q=test')
  })

  it('renders both icon links when both props are provided', () => {
    const { container } = render(
      <Place
        link="https://example.com"
        instagram="myfoo"
        map="https://maps.apple.com/?q=test"
      >
        Harp and Hound
      </Place>
    )
    expect(
      container.querySelector('[aria-label="Harp and Hound on Instagram"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[aria-label="Harp and Hound on Maps"]')
    ).not.toBeNull()
  })

  it('all links open in a new tab with noopener noreferrer', () => {
    const { container } = render(
      <Place
        link="https://example.com"
        instagram="myfoo"
        map="https://maps.apple.com/?q=test"
      >
        Harp and Hound
      </Place>
    )
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(3)
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
