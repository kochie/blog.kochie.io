/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import ProjectCard from '../index'
import type { Project } from '@/lib/project-path'

afterEach(cleanup)

const project = (over: Partial<Project>): Project =>
  ({
    slug: 'foundry',
    title: 'The Foundry',
    blurb: 'A backyard metal foundry.',
    hero: { src: 'h.jpg', alt: 'crucible', lqip: '' },
    status: 'ongoing',
    startedDate: '2025-04-01T00:00:00.000Z',
    members: [],
    ...over,
  }) as Project

describe('ProjectCard', () => {
  it('renders the title, blurb, status pill, and chapter count', () => {
    const { container } = render(
      <ProjectCard
        project={project({
          status: 'ongoing',
          members: [
            { article: {} as never, chapter: 1 },
            { article: {} as never, chapter: 2 },
          ],
        })}
      />
    )
    expect(container.textContent).toMatch(/The Foundry/)
    expect(container.textContent).toMatch(/A backyard metal foundry/)
    expect(container.textContent).toMatch(/ONGOING/i)
    expect(container.textContent).toMatch(/2 CHAPTERS/)
  })

  it('renders "0 chapters · planned" when there are no members', () => {
    const { container } = render(
      <ProjectCard project={project({ members: [] })} />
    )
    expect(container.textContent).toMatch(/0 CHAPTERS/i)
    expect(container.textContent).toMatch(/PLANNED/i)
  })

  it('uses singular "chapter" when count is 1', () => {
    const { container } = render(
      <ProjectCard
        project={project({ members: [{ article: {} as never, chapter: 1 }] })}
      />
    )
    expect(container.textContent).toMatch(/1 CHAPTER\b/i)
  })

  it('renders different status pills for ongoing / completed / paused', () => {
    for (const status of ['ongoing', 'completed', 'paused'] as const) {
      const { container, unmount } = render(
        <ProjectCard project={project({ status })} />
      )
      expect(container.textContent?.toUpperCase()).toContain(status.toUpperCase())
      unmount()
    }
  })

  it('links to the project hub', () => {
    const { container } = render(<ProjectCard project={project({})} />)
    expect(container.querySelector('a[href="/projects/foundry"]')).not.toBeNull()
  })
})
