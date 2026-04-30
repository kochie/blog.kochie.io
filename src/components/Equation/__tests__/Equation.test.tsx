/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { FigureProvider } from '@/components/Figure/context'
import Equation from '../index'

afterEach(cleanup)

describe('Equation', () => {
  it('renders block content with EQ counter when captioned', () => {
    const { getByText } = render(
      <FigureProvider>
        <Equation caption="Pythagoras">a² + b² = c²</Equation>
      </FigureProvider>
    )
    expect(getByText('EQ. 01')).toBeTruthy()
    expect(getByText(/Pythagoras/)).toBeTruthy()
  })

  it('omits the EQ prefix when no caption is given', () => {
    const { container } = render(
      <FigureProvider>
        <Equation>x² = 1</Equation>
      </FigureProvider>
    )
    expect(container.textContent).not.toMatch(/EQ\./)
  })
})
