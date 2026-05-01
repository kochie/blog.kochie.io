import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react'
import SubscribeForm from '..'

describe('SubscribeForm', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockReset()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('renders kicker, heading, fields, and beehiiv attribution', () => {
    const { container } = render(<SubscribeForm />)
    const root = container.firstElementChild as HTMLElement

    expect(within(root).getByText(/\/\/\s*SUBSCRIBE/)).toBeInTheDocument()
    expect(
      within(root).getByRole('heading', { name: /like what you see/i })
    ).toBeInTheDocument()
    expect(
      within(root).getByLabelText(/your email address/i)
    ).toBeInTheDocument()
    expect(
      within(root).getByRole('button', { name: /subscribe/i })
    ).toBeEnabled()
    expect(within(root).getByText(/powered by beehiiv/i)).toBeInTheDocument()
  })

  test('posts email + name to /api/beehiiv/subscribe and shows success state', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )

    render(<SubscribeForm />)
    fireEvent.change(screen.getByLabelText(/your email address/i), {
      target: { value: 'reader@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: 'Pat' },
    })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /you're in/i })
      ).toBeInTheDocument()
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/beehiiv/subscribe',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'reader@example.com', name: 'Pat' }),
      })
    )
  })

  test('shows error state when the API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Bad response' }), {
        status: 400,
        statusText: 'Bad Request',
      })
    )

    render(<SubscribeForm />)
    fireEvent.change(screen.getByLabelText(/your email address/i), {
      target: { value: 'reader@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/error/i)
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled()
  })
})
