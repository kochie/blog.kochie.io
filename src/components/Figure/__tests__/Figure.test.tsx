/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { FigureProvider } from '../context'
import { Figure } from '../index'

afterEach(cleanup)

describe('Figure', () => {
  it('renders children inside the frame', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="A cat">
          <img alt="cat" src="/cat.png" />
        </Figure>
      </FigureProvider>
    )
    expect(getByText('A cat')).toBeTruthy()
  })

  it('numbers figures sequentially with the FIG prefix', () => {
    const { getAllByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="first">
          <span>a</span>
        </Figure>
        <Figure kind="image" caption="second">
          <span>b</span>
        </Figure>
      </FigureProvider>
    )
    expect(getAllByText(/FIG\. 0[12]/).map((el) => el.textContent)).toEqual([
      'FIG. 01',
      'FIG. 02',
    ])
  })

  it('uses the EQ prefix when kind="equation"', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="equation" caption="Pythagoras">
          <span>a²+b²=c²</span>
        </Figure>
      </FigureProvider>
    )
    expect(getByText('EQ. 01')).toBeTruthy()
  })

  it('renders the FIG number even when no caption is provided', () => {
    // Every figure inside a FigureProvider gets a number — caption text is
    // optional, the auto-numbering is part of the editorial register.
    const { container } = render(
      <FigureProvider>
        <Figure kind="image">
          <span>silent</span>
        </Figure>
      </FigureProvider>
    )
    expect(container.textContent).toMatch(/FIG\.\s*01/)
  })

  it('omits the caption block entirely when used outside a FigureProvider', () => {
    const { container } = render(
      <Figure kind="image" caption="orphan">
        <span>x</span>
      </Figure>
    )
    expect(container.textContent).not.toMatch(/FIG\./)
  })

  it('applies the wide tier max-width to the inner wrapper without viewport breakout', () => {
    // Wide figures fit inside the page-centred content column, so they just
    // mx-auto max-w-wide — no viewport breakout needed.
    const { container } = render(
      <FigureProvider>
        <Figure kind="code" tier="wide" caption="wide one">
          <pre>code</pre>
        </Figure>
      </FigureProvider>
    )
    const root = container.querySelector('figure')
    expect(root?.className).not.toMatch(/xl:w-screen/)
    const inner = root?.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-wide/)
  })

  it('applies viewport breakout for the bleed tier so the figure escapes the column', () => {
    // Bleed figures exceed the content column, so the figure goes w-screen
    // and translates to the viewport centre. The inner wrapper re-applies
    // max-w-bleed and px-4 to keep content bounded with breathing room.
    const { container } = render(
      <FigureProvider>
        <Figure kind="image" tier="bleed" caption="hero">
          <span>x</span>
        </Figure>
      </FigureProvider>
    )
    const root = container.querySelector('figure')
    expect(root?.className).toMatch(/xl:w-screen/)
    expect(root?.className).toMatch(/xl:-translate-x-1\/2/)
    const inner = root?.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-bleed/)
    expect(inner?.className).toMatch(/px-4/)
  })

  it('renders an optional source line in mono', () => {
    const { getByText } = render(
      <FigureProvider>
        <Figure kind="image" caption="Cap" source="Photographer, 2026">
          <img alt="x" src="/x.png" />
        </Figure>
      </FigureProvider>
    )
    expect(getByText(/Photographer, 2026/)).toBeTruthy()
  })

  it('exposes the tier on data-tier so consumers (TOCSidebar) can query bleed sections', () => {
    // The TOC's bleed-jump effect queries `[data-tier="bleed"]` to find
    // figures that may collide with its sticky position. This contract
    // must hold for all three tiers.
    const tiers = ['prose', 'wide', 'bleed'] as const
    for (const tier of tiers) {
      const { container, unmount } = render(
        <FigureProvider>
          <Figure kind="image" tier={tier} caption="x">
            <span>y</span>
          </Figure>
        </FigureProvider>
      )
      const fig = container.querySelector('figure')
      expect(fig?.getAttribute('data-tier')).toBe(tier)
      unmount()
    }
  })
})
