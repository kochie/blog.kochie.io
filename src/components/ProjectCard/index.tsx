import Link from 'next/link'
import React, { type ReactElement } from 'react'
import type { Project, ProjectStatus } from '@/lib/project-path'

const statusPillClass: Record<ProjectStatus, string> = {
  ongoing: 'bg-accent/20 text-accent',
  completed: 'bg-text-soft/20 text-text-mute',
  paused: 'bg-signal/20 text-signal',
}

export interface ProjectCardProps {
  project: Project
}

/**
 * Card on the /projects index. Status pill, title, blurb, chapter count.
 * Same vocabulary as the tag cards on /tags so the two indices feel
 * related.
 */
const ProjectCard = ({ project }: ProjectCardProps): ReactElement => {
  const count = project.members.length
  const noun = count === 1 ? 'CHAPTER' : 'CHAPTERS'
  const tail = count === 0 ? ' · PLANNED' : ''
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col h-full border border-rule rounded-md p-5 hover:border-accent transition-colors duration-fast"
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`font-mono text-meta tracking-wide px-2 py-0.5 rounded ${statusPillClass[project.status]}`}
        >
          {project.status.toUpperCase()}
        </span>
        <span className="font-mono text-meta tracking-wide text-text-soft">
          {`${count} ${noun}${tail} `}
        </span>
      </div>
      <div className="font-serif font-semibold text-h3 text-text leading-tight group-hover:text-accent transition-colors duration-fast">
        {project.title}
      </div>
      {project.blurb ? (
        <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-2">
          {project.blurb}
        </p>
      ) : null}
    </Link>
  )
}

export default ProjectCard
