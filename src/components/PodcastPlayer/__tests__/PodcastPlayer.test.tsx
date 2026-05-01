/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PodcastPlayer from '../index'

vi.mock('fathom-client', () => ({ trackEvent: vi.fn() }))

afterEach(cleanup)

describe('PodcastPlayer', () => {
  beforeEach(() => {
    // jsdom does not implement HTMLMediaElement.play / pause; stub to no-op.
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: vi.fn(),
    })
  })

  it('renders pre-declared duration before metadata loads', () => {
    render(<PodcastPlayer audio="/episode.mp3" duration="12:34" title="Halo" />)
    expect(screen.getByText(/12:34/)).toBeTruthy()
  })

  it('shows --:-- when no duration is provided', () => {
    render(<PodcastPlayer audio="/episode.mp3" title="Halo" />)
    expect(screen.getByText('--:--')).toBeTruthy()
  })

  it('cycles playback speed 1x → 1.5x → 2x → 1x', () => {
    render(<PodcastPlayer audio="/x.mp3" title="Halo" />)
    const speed = screen.getByLabelText(/Playback speed/i)
    expect(speed.textContent).toBe('1×')
    fireEvent.click(speed)
    expect(speed.textContent).toBe('1.5×')
    fireEvent.click(speed)
    expect(speed.textContent).toBe('2×')
    fireEvent.click(speed)
    expect(speed.textContent).toBe('1×')
  })

  it('toggles play/pause label and pressed state when clicked', () => {
    const { container } = render(<PodcastPlayer audio="/x.mp3" title="Halo" />)
    const button = screen.getByLabelText(/Play audio/i)
    expect(button.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(button)
    // jsdom won't fire native play events; simulate the audio element firing.
    const audioEl = container.querySelector('audio')!
    fireEvent.play(audioEl)
    expect(
      screen.getByLabelText(/Pause audio/i).getAttribute('aria-pressed')
    ).toBe('true')
    fireEvent.pause(audioEl)
    expect(
      screen.getByLabelText(/Play audio/i).getAttribute('aria-pressed')
    ).toBe('false')
  })

  it('formats hours when duration exceeds an hour', () => {
    const { container } = render(<PodcastPlayer audio="/x.mp3" title="Halo" />)
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', {
      configurable: true,
      value: 3725, // 1:02:05
    })
    fireEvent.loadedMetadata(audioEl)
    expect(screen.getByText('1:02:05')).toBeTruthy()
  })
})
