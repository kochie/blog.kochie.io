/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import Color from '../index'

let writeText: ReturnType<typeof vi.fn>

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Color', () => {
  it('renders the hex in upper case', () => {
    const { container } = render(<Color hex="#c34406" />)
    expect(container.textContent).toMatch(/#C34406/)
  })

  it('uppercases hex codes that came in already-cased', () => {
    const { container } = render(<Color hex="#C34406" />)
    expect(container.textContent).toMatch(/#C34406/)
  })

  it('prepends a # when the input omits one', () => {
    const { container } = render(<Color hex="C34406" />)
    expect(container.textContent).toMatch(/#C34406/)
  })

  it('paints the splotch with the supplied colour', () => {
    const { container } = render(<Color hex="#c34406" />)
    const splotch = container.querySelector('[aria-hidden]') as HTMLElement
    expect(splotch).not.toBeNull()
    expect(splotch.style.backgroundColor).not.toBe('')
  })

  it('renders as a clickable button with an accessible label', () => {
    const { getByRole } = render(<Color hex="#C34406" />)
    const btn = getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe('Copy #C34406 to clipboard')
  })

  it('writes the hex to the clipboard on click', async () => {
    const { getByRole } = render(<Color hex="#c34406" />)
    fireEvent.click(getByRole('button'))
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('#C34406'))
  })

  it('flips to "COPIED" after a successful copy and reverts to the hex', async () => {
    const { getByRole, container } = render(<Color hex="#C34406" />)
    fireEvent.click(getByRole('button'))
    // The promise + state update take a microtask to land — wait for the
    // COPIED text to appear rather than asserting synchronously.
    await vi.waitFor(() =>
      expect(container.textContent).toMatch(/COPIED/)
    )
    // The setTimeout in the component reverts state after COPIED_DURATION_MS;
    // wait long enough for that branch to fire, then re-check the hex.
    await vi.waitFor(
      () => expect(container.textContent).toMatch(/#C34406/),
      { timeout: 2000 }
    )
  })

  it('does not throw when the clipboard API is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined })
    const { getByRole } = render(<Color hex="#C34406" />)
    expect(() => fireEvent.click(getByRole('button'))).not.toThrow()
  })
})
