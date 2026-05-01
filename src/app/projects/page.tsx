import React from 'react'
import { Metadata } from 'next'
import {
  buildProject,
  getAllProjectManifests,
  type Project,
} from '@/lib/project-path'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { ProjectCard } from '@/components'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Ongoing series and bodies of work.',
  alternates: { canonical: '/projects' },
}

const STATUS_RANK: Record<Project['status'], number> = {
  ongoing: 0,
  paused: 1,
  completed: 2,
}

export default async function ProjectsIndex() {
  const manifests = await getAllProjectManifests()
  const articles = await getAllArticlesMetadata()
  const projects = await Promise.all(
    manifests.map((m) => buildProject(m.slug, articles))
  )
  // Ongoing first, then paused, then completed. Within each, most-recently
  // active first (= latest member publishedDate, falling back to startedDate).
  const lastActivity = (p: Project): number => {
    if (p.members.length > 0) {
      const latest = p.members.reduce((acc, m) => {
        const t = new Date(m.article.publishedDate).getTime()
        return t > acc ? t : acc
      }, 0)
      return latest
    }
    return new Date(p.startedDate).getTime()
  }
  projects.sort((a, b) => {
    if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) {
      return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    }
    return lastActivity(b) - lastActivity(a)
  })

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">PROJECTS</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Projects.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          Ongoing series and bodies of work — collections of shorter chapters
          that tell a longer story.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="mx-auto max-w-prose px-4 py-12 font-serif italic text-text-mute">
          No projects yet.
        </div>
      ) : (
        <ul className="mx-auto max-w-bleed px-4 pb-16 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <li key={p.slug} className="h-full">
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
