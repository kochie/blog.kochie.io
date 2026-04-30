/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import Sidenote from '../index'

afterEach(cleanup)

describe('Sidenote', () => {
  it('renders the marker and the note content', () => {
    const { container, getByText } = render(
      <Sidenote n={1}>This is the note text.</Sidenote>
    )
    const sup = container.querySelector('sup')
    expect(sup?.textContent).toBe('1')
    expect(getByText('This is the note text.')).toBeTruthy()
  })

  it('exposes aria-describedby linking marker to note', () => {
    const { container } = render(<Sidenote n={2}>Body</Sidenote>)
    const marker = container.querySelector('sup')
    const note = container.querySelector('aside')
    expect(marker?.getAttribute('aria-describedby')).toBe(note?.id)
    expect(note?.id).toMatch(/sidenote-/)
  })
})
