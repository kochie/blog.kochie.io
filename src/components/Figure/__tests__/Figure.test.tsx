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

  it('omits the number prefix when no caption is provided', () => {
    const { container } = render(
      <FigureProvider>
        <Figure kind="image">
          <span>silent</span>
        </Figure>
      </FigureProvider>
    )
    expect(container.textContent).not.toMatch(/FIG\./)
  })

  it('applies the wide tier max-width class', () => {
    const { container } = render(
      <FigureProvider>
        <Figure kind="code" tier="wide" caption="wide one">
          <pre>code</pre>
        </Figure>
      </FigureProvider>
    )
    const root = container.querySelector('figure')
    expect(root?.className).toMatch(/max-w-wide/)
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
})
