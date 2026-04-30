/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { FigureProvider } from '@/components/Figure/context'
import Canvas from '../index'

afterEach(cleanup)

describe('Canvas', () => {
  it('renders children inside the figure frame', () => {
    const { getByTestId } = render(
      <FigureProvider>
        <Canvas caption="A simulation">
          <div data-testid="canvas-child">interactive content</div>
        </Canvas>
      </FigureProvider>
    )
    expect(getByTestId('canvas-child').textContent).toBe('interactive content')
  })

  it('shows the // interactive marker', () => {
    const { container } = render(
      <FigureProvider>
        <Canvas caption="A simulation">
          <span>x</span>
        </Canvas>
      </FigureProvider>
    )
    expect(container.textContent).toMatch(/\/\/\s*interactive/)
  })

  it('numbers the figure with FIG. when captioned', () => {
    const { getByText } = render(
      <FigureProvider>
        <Canvas caption="Sim one">
          <span>a</span>
        </Canvas>
      </FigureProvider>
    )
    expect(getByText('FIG. 01')).toBeTruthy()
  })

  it('renders nothing extra when no caption is provided', () => {
    const { container } = render(
      <FigureProvider>
        <Canvas>
          <span>silent</span>
        </Canvas>
      </FigureProvider>
    )
    expect(container.textContent).not.toMatch(/FIG\./)
    expect(container.textContent).toMatch(/\/\/\s*interactive/)
  })
})
