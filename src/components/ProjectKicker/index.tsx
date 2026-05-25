import Link from 'next/link'
import React, { type ReactElement } from 'react'

export interface ProjectKickerProps {
  projectSlug: string
  projectTitle: string
  chapter: number
}

/**
 * Inline kicker segment that sits next to the article number in the
 * article kicker line, e.g. `FOUNDRY · CH.04`. The project name links
 * to the project hub.
 */
const ProjectKicker = ({
  projectSlug,
  projectTitle,
  chapter,
}: ProjectKickerProps): ReactElement => {
  const padded = String(chapter).padStart(2, '0')
  return (
    <>
      <Link
        href={`/projects/${projectSlug}`}
        className="text-accent hover:underline uppercase"
      >
        {projectTitle}
      </Link>
      <span className="text-text-soft mx-1">·</span>
      <span className="text-accent">CH.{padded}</span>
    </>
  )
}

export default ProjectKicker
