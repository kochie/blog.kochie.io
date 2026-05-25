/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { FigureProvider, useFigureNumber, useEquationNumber } from '../context'

const FigureProbe = () => <span data-testid="fig">{useFigureNumber()}</span>
const EqProbe = () => <span data-testid="eq">{useEquationNumber()}</span>

describe('FigureProvider', () => {
  afterEach(() => cleanup())

  it('numbers figures sequentially within a single provider', () => {
    const { getAllByTestId } = render(
      <FigureProvider>
        <FigureProbe />
        <FigureProbe />
        <FigureProbe />
      </FigureProvider>
    )
    expect(getAllByTestId('fig').map((n) => n.textContent)).toEqual([
      '1',
      '2',
      '3',
    ])
  })

  it('numbers equations on a separate counter from figures', () => {
    const { getAllByTestId } = render(
      <FigureProvider>
        <FigureProbe />
        <EqProbe />
        <FigureProbe />
        <EqProbe />
      </FigureProvider>
    )
    expect(getAllByTestId('fig').map((n) => n.textContent)).toEqual(['1', '2'])
    expect(getAllByTestId('eq').map((n) => n.textContent)).toEqual(['1', '2'])
  })

  it('returns 0 outside a FigureProvider so usage is detectable', () => {
    const { getByTestId } = render(<FigureProbe />)
    expect(getByTestId('fig').textContent).toBe('0')
  })
})
