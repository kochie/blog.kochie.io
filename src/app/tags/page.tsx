import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { getAllArticlesMetadata, getUsedTags } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadataConfig from '$metadata'

const TAGS_DESCRIPTION =
  'Every tag used across the blog — pick a tag, follow the thread.'

export const metadata: Metadata = {
  title: 'Tags',
  description: TAGS_DESCRIPTION,
  alternates: {
    canonical: '/tags',
  },
  openGraph: {
    type: 'website',
    url: '/tags',
    title: 'Tags | Kochie Engineering',
    description: TAGS_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tags | Kochie Engineering',
    description: TAGS_DESCRIPTION,
  },
}

export default async function Tags() {
  const articles = await getAllArticlesMetadata()
  const tagsCounted = getUsedTags(articles, metadataConfig.tags as Tag[])

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

      <ul className="mx-auto max-w-bleed px-4 pb-16 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tagsCounted.map((tag) => (
          <li key={tag.slug} className="h-full">
            <Link
              href={`/tags/${tag.slug}`}
              className="group flex flex-col h-full border border-rule rounded-md p-5 hover:border-accent transition-colors duration-fast"
            >
              <div className="font-mono text-meta tracking-wide text-text-soft mb-3 flex items-baseline gap-2">
                <span className="text-accent">
                  {`// ${String(tag.articleCount).padStart(2, '0')}`}
                </span>
                <span>{tag.articleCount === 1 ? 'ESSAY' : 'ESSAYS'}</span>
              </div>
              <div className="font-serif font-semibold text-h3 text-text capitalize leading-tight group-hover:text-accent transition-colors duration-fast">
                {tag.name}
              </div>
              {tag.blurb ? (
                <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-2">
                  {tag.blurb}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
