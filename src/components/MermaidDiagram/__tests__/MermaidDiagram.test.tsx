import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import MermaidDiagram from '../MermaidDiagram'

describe('MermaidDiagram', () => {
  test('renders a host div without its own <figure> wrapper', () => {
    // Callers wrap MermaidDiagram in the project's <Figure>; the diagram must
    // not emit a competing <figure>/<figcaption> of its own (would double up
    // on the FIG. nn caption and break semantic figure nesting).
    const { container } = render(
      <MermaidDiagram source={`flowchart LR\n  A --> B`} />
    )
    expect(container.querySelector('figure')).toBeNull()
    expect(container.querySelector('figcaption')).toBeNull()
    const host = container.querySelector('[role="img"]')
    expect(host).not.toBeNull()
  })

  test('forwards className to the host element', () => {
    const { container } = render(
      <MermaidDiagram source={`flowchart LR\n  A --> B`} className="ring-2" />
    )
    const host = container.querySelector('[role="img"]') as HTMLElement | null
    expect(host?.className).toContain('ring-2')
  })
})
