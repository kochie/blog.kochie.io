/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ProjectBanner from '../index'

afterEach(cleanup)

describe('ProjectBanner', () => {
  it('shows the project title and current chapter / total', () => {
    const { container } = render(
      <ProjectBanner
        projectSlug="foundry"
        projectTitle="The Foundry"
        chapter={4}
        total={5}
      />
    )
    expect(container.textContent).toMatch(/The Foundry/)
    expect(container.textContent).toMatch(/CHAPTER 4 OF 5/i)
  })

  it('links to the project hub', () => {
    const { container } = render(
      <ProjectBanner
        projectSlug="foundry"
        projectTitle="The Foundry"
        chapter={4}
        total={5}
      />
    )
    const link = container.querySelector('a[href="/projects/foundry"]')
    expect(link).not.toBeNull()
  })

  it('uses the clay accent for the left stripe', () => {
    const { container } = render(
      <ProjectBanner
        projectSlug="foundry"
        projectTitle="The Foundry"
        chapter={1}
        total={1}
      />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toMatch(/border-l-/)
    expect(root.className).toMatch(/border-accent/)
  })
})
