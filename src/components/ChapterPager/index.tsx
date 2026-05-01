import Link from 'next/link'
import React, { type ReactElement } from 'react'
import type { ProjectMember } from '@/lib/project-path'

export interface ChapterPagerProps {
  projectSlug: string
  projectTitle: string
  prev: ProjectMember | null
  next: ProjectMember | null
}

const cardClass =
  'group flex flex-col h-full border border-rule rounded-md p-5 bg-bg-soft hover:border-accent transition-colors duration-fast no-underline'
const labelClass =
  'font-mono text-meta tracking-wide text-text-soft mb-3'
const labelAccent = 'text-accent'
const titleClass =
  'font-serif font-semibold text-h3 text-text leading-tight group-hover:text-accent transition-colors duration-fast'

const PrevSide = ({
  projectSlug,
  projectTitle,
  prev,
}: {
  projectSlug: string
  projectTitle: string
  prev: ProjectMember | null
}) => {
  if (!prev) {
    return (
      <Link href={`/projects/${projectSlug}`} className={cardClass}>
        <div className={labelClass}>
          <span className={labelAccent}>{'← '}</span>VIEW PROJECT
        </div>
        <div className="font-mono text-meta tracking-wide text-accent mb-1">
          {projectTitle.toUpperCase()}
        </div>
        <div className={titleClass}>All chapters</div>
      </Link>
    )
  }
  const padded = String(prev.chapter).padStart(2, '0')
  return (
    <Link href={`/articles/${prev.article.articleDir}`} className={cardClass}>
      <div className={labelClass}>
        <span className={labelAccent}>{'← '}</span>PREVIOUS CHAPTER
      </div>
      <div className="font-mono text-meta tracking-wide text-accent mb-1">
        {projectTitle.toUpperCase()} · CH.{padded}
      </div>
      <div className={titleClass}>{prev.article.title}</div>
    </Link>
  )
}

const NextSide = ({
  projectSlug,
  projectTitle,
  next,
}: {
  projectSlug: string
  projectTitle: string
  next: ProjectMember | null
}) => {
  if (!next) {
    return (
      <Link href={`/projects/${projectSlug}`} className={`${cardClass} text-right`}>
        <div className={labelClass}>
          VIEW PROJECT<span className={labelAccent}>{' →'}</span>
        </div>
        <div className="font-mono text-meta tracking-wide text-accent mb-1">
          {projectTitle.toUpperCase()}
        </div>
        <div className={titleClass}>All chapters</div>
      </Link>
    )
  }
  const padded = String(next.chapter).padStart(2, '0')
  return (
    <Link
      href={`/articles/${next.article.articleDir}`}
      className={`${cardClass} text-right`}
    >
      <div className={labelClass}>
        NEXT CHAPTER<span className={labelAccent}>{' →'}</span>
      </div>
      <div className="font-mono text-meta tracking-wide text-accent mb-1">
        {projectTitle.toUpperCase()} · CH.{padded}
      </div>
      <div className={titleClass}>{next.article.title}</div>
    </Link>
  )
}

/**
 * Foot-of-article prev/next chapter pager. Replaces SimilarArticles for
 * project articles. The unavailable side (chapter 1 has no prev, last
 * chapter has no next) wraps to a VIEW PROJECT card pointing at the hub.
 */
const ChapterPager = ({
  projectSlug,
  projectTitle,
  prev,
  next,
}: ChapterPagerProps): ReactElement => {
  return (
    <section
      aria-label={`Chapter navigation for ${projectTitle}`}
      className="mx-auto max-w-bleed px-4 my-16 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <PrevSide projectSlug={projectSlug} projectTitle={projectTitle} prev={prev} />
      <NextSide projectSlug={projectSlug} projectTitle={projectTitle} next={next} />
    </section>
  )
}

export default ChapterPager
