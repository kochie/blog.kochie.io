import React from 'react'
import { Metadata } from 'next'
import HeroFeature from '@/components/HeroFeature'
import RecentRow from '@/components/RecentRow'
import ArchiveList from '@/components/ArchiveList'
import { getAllArticlesMetadata, buildMetadata } from '@/lib/article-path'
import { JournalStrip } from '@/components/JournalStrip'
import { getRecentEntries } from '@/lib/journal-path'

const HOME_DESCRIPTION =
  'Field notes from a one-person engineering studio. Software, mostly. Sometimes maths.'

export const metadata: Metadata = {
  title: 'Kochie Engineering / Blog',
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Kochie Engineering',
    title: 'Kochie Engineering / Blog',
    url: '/',
    locale: 'en-AU',
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kochie Engineering / Blog',
    description: HOME_DESCRIPTION,
  },
}

export default async function Index() {
  const articles = await getAllArticlesMetadata()
  if (articles.length === 0) {
    return (
      <main className="mx-auto max-w-prose px-4 py-24 text-text">
        <p className="font-serif italic text-text-mute">
          No essays yet. Come back soon.
        </p>
      </main>
    )
  }

  // Pick the featured article: frontmatter-flagged, or fall back to most recent.
  const featured = articles.find((a) => a.featured) ?? articles[0]

  // Recent: the next 3 articles (excluding the featured one).
  const recent = articles
    .filter((a) => a.articleDir !== featured.articleDir)
    .slice(0, 3)

  // Archive: the full list.
  const archive = articles

  const journalEntries = await getRecentEntries(3)

  // Author lookup for the hero byline.
  const meta = await buildMetadata()
  const author = meta.authors?.[featured.author] ?? {
    username: featured.author,
    fullName: featured.author,
    email: '',
    socialMedia: [],
    avatar: { src: '', lqip: '' },
    bio: '',
    fediverse: { creator: '' },
  }

  return (
    <main className="bg-bg text-text">
      <HeroFeature article={featured} author={author} />
      <RecentRow articles={recent} />
      <JournalStrip entries={journalEntries} />
      <ArchiveList articles={archive} id="archive" />
    </main>
  )
}
