import Link from 'next/link'
import React, { type ReactElement } from 'react'

export interface ProjectBannerProps {
  projectSlug: string
  projectTitle: string
  chapter: number
  total: number
}

/**
 * Article-page banner declaring "you're inside a project" with the current
 * chapter / total and a link to the hub. Sits between the meta line and
 * the body content.
 */
const ProjectBanner = ({
  projectSlug,
  projectTitle,
  chapter,
  total,
}: ProjectBannerProps): ReactElement => {
  return (
    <Link
      href={`/projects/${projectSlug}`}
      aria-label={`View project: ${projectTitle}`}
      className="group mx-auto max-w-prose px-4 my-6 flex items-center gap-3 border-l-2 border-accent bg-bg-soft rounded-r-md py-3 pr-4 pl-4 font-mono text-meta text-text-mute tracking-wide hover:bg-bg-deep transition-colors duration-fast"
    >
      <span className="text-accent">{'// IN A PROJECT:'}</span>
      <span className="text-text font-semibold">{projectTitle}</span>
      <span className="text-text-soft">·</span>
      <span>
        CHAPTER {chapter} OF {total}
      </span>
      <span className="ml-auto text-accent group-hover:underline">
        VIEW PROJECT →
      </span>
    </Link>
  )
}

export default ProjectBanner
