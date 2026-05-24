import { Suspense } from 'react'
import { getEntries, getAllJournalTags, groupEntriesByMonth } from '@/lib/journal-path'
import { JournalFeed } from '@/components/JournalFeed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal — Kochie Engineering',
  description:
    'Short observations, links, and thoughts — too brief for an essay.',
}

export default async function JournalPage() {
  const [entries, allTags] = await Promise.all([
    getEntries(),
    getAllJournalTags(),
  ])
  const groups = groupEntriesByMonth(entries)

  return (
    <main className="bg-bg text-text">
      <header className="mx-auto max-w-bleed px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          {'// '}
          <span className="text-accent">JOURNAL</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          Field notes.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
          Short observations, links, and thoughts — too brief for an essay.
        </p>
      </header>

      <div className="mx-auto max-w-bleed px-4 pb-24">
        <Suspense
          fallback={
            <div className="font-mono text-xs text-text-soft py-12">
              Loading entries…
            </div>
          }
        >
          <JournalFeed groups={groups} allTags={allTags} />
        </Suspense>
      </div>
    </main>
  )
}
