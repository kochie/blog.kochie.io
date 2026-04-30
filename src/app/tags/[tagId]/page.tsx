import React from 'react'
import { Metadata } from 'next'
import ArchiveList from '@/components/ArchiveList'
import { getAllArticlesMetadata } from '@/lib/article-path'
import type { Tag } from 'types/metadata'

import metadata from '$metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagId: string }>
}): Promise<Metadata> {
  const tagId = (await params).tagId
  const tagName = tagId.replace(/^\w/, (c) => c.toUpperCase())
  const image = metadata.tags.find(
    (tag: Tag) => tag.name.toLowerCase() === tagId.toLowerCase()
  )?.image

  return {
    title: tagName,
    alternates: {
      canonical: `/tags/${tagId.toLowerCase()}`,
    },
    description: `A collection of articles tagged with ${tagName}.`,
    openGraph: {
      title: `${tagName} | Kochie Engineering`,
      url: `/tags/${tagId.toLowerCase()}`,
      description: `A collection of articles tagged with ${tagName}.`,
      type: 'website',
      siteName: 'Kochie Engineering',
      images: image
        ? { url: `/images/tags/${image.src}`, alt: tagName }
        : undefined,
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
    </main>
  )
}

export const generateStaticParams = async () => {
  if (!Array.isArray(metadata.tags)) return []
  return (metadata.tags as Tag[]).map((tag) => ({
    tagId: tag.name,
  }))
}

export default TagComponent
