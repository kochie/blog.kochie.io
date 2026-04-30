import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { getAllArticlesMetadata } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadataConfig from '$metadata'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'The tags used in my blog posts.',
  alternates: {
    canonical: `/tags`,
  },
}

export default async function Tags() {
  const articles = await getAllArticlesMetadata()
  const tagsCounted = (metadataConfig.tags as Tag[]).map((tag) => ({
    ...tag,
    articleCount: articles.reduce(
      (acc, article) => acc + (article.tags.includes(tag.name) ? 1 : 0),
      0
    ),
  }))

  // Sort by count descending, then alphabetical.
  tagsCounted.sort(
    (a, b) =>
      b.articleCount - a.articleCount || a.name.localeCompare(b.name)
  )

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">TAGS</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          All tags.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          {tagsCounted.length} ways to slice the archive.
        </p>
      </header>

      <ul className="mx-auto max-w-bleed px-4 pb-16 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tagsCounted.map((tag) => (
          <li key={tag.name}>
            <Link
              href={`/tags/${tag.name.toLowerCase()}`}
              className="group flex items-baseline justify-between border border-rule rounded-md px-4 py-3 hover:border-accent transition-colors duration-fast"
            >
              <div>
                <div className="font-serif font-semibold text-text capitalize group-hover:text-accent transition-colors duration-fast">
                  {tag.name}
                </div>
                {tag.blurb ? (
                  <div className="font-serif italic text-body-sm text-text-mute leading-snug mt-1">
                    {tag.blurb}
                  </div>
                ) : null}
              </div>
              <div className="font-mono text-meta text-text-soft tracking-wide whitespace-nowrap ml-4">
                {tag.articleCount}{' '}
                {tag.articleCount === 1 ? 'essay' : 'essays'}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
