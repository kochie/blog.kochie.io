/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ProjectKicker from '../index'

afterEach(cleanup)

describe('ProjectKicker', () => {
  it('renders the project title in upper case and the chapter as CH.NN', () => {
    const { container } = render(
      <ProjectKicker projectSlug="foundry" projectTitle="The Foundry" chapter={4} />
    )
    expect(container.textContent).toMatch(/THE FOUNDRY/i)
    expect(container.textContent).toMatch(/CH\.04/)
  })

  it('zero-pads chapter numbers to two digits', () => {
    const { container } = render(
      <ProjectKicker projectSlug="x" projectTitle="X" chapter={1} />
    )
    expect(container.textContent).toMatch(/CH\.01/)
  })

  it('does not zero-pad past two digits', () => {
    const { container } = render(
      <ProjectKicker projectSlug="x" projectTitle="X" chapter={12} />
    )
    expect(container.textContent).toMatch(/CH\.12/)
  })

  it('links the project title to /projects/<slug>', () => {
    const { container } = render(
      <ProjectKicker projectSlug="foundry" projectTitle="The Foundry" chapter={4} />
    )
    const link = container.querySelector('a[href="/projects/foundry"]')
    expect(link).not.toBeNull()
  })
})
