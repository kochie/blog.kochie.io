import {
  getEntries,
  getAllJournalTags,
  groupEntriesByMonth,
} from '@/lib/journal-path'
import { JournalFeed } from '@/components/JournalFeed'
import type { FeedGroup } from '@/components/JournalFeed'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import { compileJournalMdx } from '@/lib/compile-journal-mdx'
import { journalComponents } from '@/components/MDXWrapper/journal-components'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Journal — Kochie Engineering',
  description:
    'Short observations, links, and thoughts — too brief for an essay.',
  alternates: {
    canonical: '/journal',
  },
  openGraph: {
    type: 'website',
    url: '/journal',
    title: 'Journal | Kochie Engineering',
    description:
      'Short observations, links, and thoughts — too brief for an essay.',
    siteName: 'Kochie Engineering',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal | Kochie Engineering',
    description:
      'Short observations, links, and thoughts — too brief for an essay.',
  },
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag: activeTag = null } = await searchParams

  const [allEntries, allTags] = await Promise.all([
    getEntries(),
    getAllJournalTags(),
  ])

  const filteredEntries = activeTag
    ? allEntries.filter((e) => e.tags.includes(activeTag))
    : allEntries

  const rawGroups = groupEntriesByMonth(filteredEntries)

  const groups: FeedGroup[] = await Promise.all(
    rawGroups.map(async (group) => ({
      label: group.label,
      entries: await Promise.all(
        group.entries.map(async (entry) => {
          const MDXContent = await compileJournalMdx(entry.body)
          return {
            slug: entry.slug,
            tags: entry.tags,
            node: (
              <JournalEntryCard key={entry.slug} entry={entry}>
                <MDXContent components={journalComponents} />
              </JournalEntryCard>
            ),
          }
        })
      ),
    }))
  )

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-wide px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">JOURNAL</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Field notes.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-wide">
          Short observations, links, and thoughts — too brief for an essay.
        </p>
      </header>

      <div className="mx-auto max-w-wide px-4 pb-24">
        <JournalFeed groups={groups} allTags={allTags} activeTag={activeTag} />
      </div>
    </main>
  )
}
