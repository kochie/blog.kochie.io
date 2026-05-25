import React from 'react'
import { Metadata } from 'next'
import ArchiveList from '@/components/ArchiveList'
import TagChips from '@/components/TagChips'
import { getAllArticlesMetadata, getUsedTags } from '@/lib/article-path'
import metadataConfig from '$metadata'
import type { Tag } from 'types/metadata'

const ARCHIVE_DESCRIPTION =
  'Every essay on Kochie Engineering / Blog, grouped by year.'

export const metadata: Metadata = {
  title: 'Archive',
  description: ARCHIVE_DESCRIPTION,
  alternates: {
    canonical: '/archive',
  },
  openGraph: {
    type: 'website',
    url: '/archive',
    title: 'Archive | Kochie Engineering',
    description: ARCHIVE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archive | Kochie Engineering',
    description: ARCHIVE_DESCRIPTION,
  },
}

export default async function Archive() {
  const articles = await getAllArticlesMetadata()

  // Build the tag chip row from the union of all tags used in articles,
  // sorted by frequency (most-tagged first). Pull display names from
  // metadata.yaml so the chips read "CDK"/"WebDev" rather than the lowercase
  // article-frontmatter literals.
  const sortedTags = getUsedTags(articles, metadataConfig.tags as Tag[]).map(
    (t) => t.name
  )

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">ARCHIVE</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Every essay, by year.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          The full Kochie Engineering / Blog index. {articles.length} essays and
          counting.
        </p>
      </header>

      <div className="mx-auto max-w-bleed px-4 pb-8">
        <TagChips tags={sortedTags} label="// FILTER · by tag" />
      </div>

      <ArchiveList articles={articles} />
    </main>
  )
}
