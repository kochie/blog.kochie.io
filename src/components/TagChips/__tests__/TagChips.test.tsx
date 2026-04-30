/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import TagChips from '../index'

afterEach(cleanup)

describe('TagChips', () => {
  it('renders one chip per tag with a /tags/ href', () => {
    const { container } = render(<TagChips tags={['cdk', 'maths', 'gaming']} />)
    const links = container.querySelectorAll('a[href^="/tags/"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('/tags/cdk')
    expect(links[2].getAttribute('href')).toBe('/tags/gaming')
  })

  it('renders nothing when given an empty array', () => {
    const { container } = render(<TagChips tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('lower-cases the tag in the URL but preserves the visible label', () => {
    const { getByText, container } = render(<TagChips tags={['CDK']} />)
    expect(getByText('CDK')).toBeTruthy()
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/tags/cdk')
  })
})
