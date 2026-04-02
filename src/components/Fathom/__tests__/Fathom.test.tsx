import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fathom from 'fathom-client'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/articles/hello'),
  useSearchParams: vi.fn(() => new URLSearchParams('ref=docs')),
}))

vi.mock('fathom-client', () => ({
  load: vi.fn(),
  trackPageview: vi.fn(),
}))

import Fathom from '..'

describe('Fathom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads Fathom with site options and records an initial pageview', async () => {
    const { container } = render(<Fathom />)

    expect(container.firstChild).toBeNull()

    await waitFor(() => {
      expect(fathom.load).toHaveBeenCalledWith(
        'QFZGKZMZ',
        expect.objectContaining({
          includedDomains: ['blog.kochie.io'],
          spa: 'auto',
        })
      )
    })

    expect(fathom.trackPageview).toHaveBeenCalled()
  })
})
