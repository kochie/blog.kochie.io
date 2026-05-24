import React from 'react'
import { Metadata } from 'next'
import ArchiveList from '@/components/ArchiveList'
import { getAllArticlesMetadata, getUsedTags } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadata from '$metadata'

import { getEntries } from '@/lib/journal-path'
import { JournalEntryCard } from '@/components/JournalEntryCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagId: string }>
}): Promise<Metadata> {
  const tagId = (await params).tagId
  // Prefer the metadata.yaml proper casing ("CDK", "WebDev") over the
  // crude first-letter-uppercase of the URL slug, which would emit "Cdk"
  // and surface in the browser tab title.
  const tagMeta = (metadata.tags as Tag[]).find(
    (tag) => tag.name.toLowerCase() === tagId.toLowerCase()
  )
  const tagName = tagMeta?.name ?? tagId.replace(/^\w/, (c) => c.toUpperCase())
  const image = tagMeta?.image

  const description = `A collection of articles tagged with ${tagName}.`
  return {
    title: tagName,
    alternates: {
      canonical: `/tags/${tagId.toLowerCase()}`,
    },
    description,
    openGraph: {
      title: `${tagName} | Kochie Engineering`,
      url: `/tags/${tagId.toLowerCase()}`,
      description,
      type: 'website',
      siteName: 'Kochie Engineering',
      images: image
        ? { url: `/images/tags/${image.src}`, alt: tagName }
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tagName} | Kochie Engineering`,
      description,
    },
  }
}

const TagComponent = async ({
  params,
}: {
  params: Promise<{ tagId: string }>
}) => {
  const { tagId } = await params
  const allArticles = await getAllArticlesMetadata()
  const tagArticles = allArticles.filter((article) =>
    article.tags.some((t) => t.toLowerCase() === tagId.toLowerCase())
  )

  const allJournalEntries = await getEntries()
  const tagJournalEntries = allJournalEntries.filter((entry) =>
    entry.tags.some((t) => t.toLowerCase() === tagId.toLowerCase())
  )

  const tagMeta = (metadata.tags as Tag[]).find(
    (t) => t.name.toLowerCase() === tagId.toLowerCase()
  )
  const displayName = tagMeta?.name ?? tagId
  const blurb = tagMeta?.blurb ?? `Essays tagged with ${displayName}.`

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">TAG</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4 capitalize">
          {displayName}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          {blurb}
        </p>
        <p className="font-mono text-meta text-text-soft tracking-wide mt-4">
          {tagArticles.length} {tagArticles.length === 1 ? 'essay' : 'essays'}
        </p>
      </header>

      {tagArticles.length === 0 ? (
        <div className="mx-auto max-w-prose px-4 py-12 font-serif italic text-text-mute">
          No essays tagged {displayName} yet.
        </div>
      ) : (
        <ArchiveList articles={tagArticles} />
      )}

      {tagJournalEntries.length > 0 && (
        <section className="mx-auto max-w-bleed px-4 pt-8 pb-16">
          <div className="font-mono text-xs text-text-soft mb-8 border-t border-rule pt-8">
            {'// JOURNAL ENTRIES'}
          </div>
          <div className="space-y-8 max-w-prose">
            {tagJournalEntries.map((entry) => (
              <JournalEntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export const generateStaticParams = async () => {
  // Generate routes only for tags that articles actually use, with the
  // lowercased slug that the tags index links to.
  const articles = await getAllArticlesMetadata()
  return getUsedTags(articles, metadata.tags as Tag[]).map((tag) => ({
    tagId: tag.slug,
  }))
}

export default TagComponent
