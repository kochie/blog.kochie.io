import Link from 'next/link'
import React, { type ReactElement } from 'react'
import type { ProjectMember } from '@/lib/project-path'

export interface ChapterTimelineProps {
  members: ReadonlyArray<ProjectMember>
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()

/**
 * Numbered timeline of project chapters. Each row has a tick column with
 * the chapter number and a card with the article's title, date, and read
 * time. Renders an empty-state when the project has no published members.
 */
const ChapterTimeline = ({ members }: ChapterTimelineProps): ReactElement => {
  if (members.length === 0) {
    return (
      <div className="font-serif italic text-text-mute py-6">
        No chapters published yet.
      </div>
    )
  }
  return (
    <ol className="list-none p-0 m-0 flex flex-col">
      {members.map((m) => {
        const padded = String(m.chapter).padStart(2, '0')
        return (
          <li
            key={m.article.articleDir}
            className="grid grid-cols-[64px_minmax(0,1fr)] gap-4"
          >
            <div className="text-right pr-4 py-5 border-r border-rule font-mono text-meta tracking-wide text-accent">
              CH.{padded}
            </div>
            <Link
              href={`/articles/${m.article.articleDir}`}
              className="my-2 group flex flex-col rounded-md border border-rule bg-bg-soft p-4 hover:border-accent transition-colors duration-fast"
            >
              <div className="font-mono text-meta tracking-wide text-text-soft mb-1">
                {formatDate(m.article.publishedDate)}
              </div>
              <h3 className="font-serif font-semibold text-h3 text-text leading-tight mb-1 group-hover:text-accent transition-colors duration-fast">
                {m.article.title}
              </h3>
              {m.article.blurb ? (
                <p className="font-serif italic text-body-sm text-text-mute leading-snug mb-2">
                  {m.article.blurb}
                </p>
              ) : null}
              <div className="font-mono text-meta tracking-wide text-text-soft">
                {m.article.readTime.toUpperCase()}
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export default ChapterTimeline
