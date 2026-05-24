import Link from 'next/link'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalStripProps {
  entries: JournalEntry[]
}

export function JournalStrip({ entries }: JournalStripProps) {
  if (entries.length === 0) return null

  return (
    <section className="mx-auto max-w-bleed pr-4 py-8 border-l-[3px] border-accent pl-8">
      <div className="flex justify-between items-baseline mb-6">
        <span className="font-mono text-xs text-text-soft">
          {'// FROM THE JOURNAL'}
        </span>
        <Link
          href="/journal"
          className="font-mono text-xs text-accent hover:underline"
        >
          → all entries
        </Link>
      </div>
      <div className="space-y-5">
        {entries.map((entry) => (
          <JournalEntryCard key={entry.slug} entry={entry} compact />
        ))}
      </div>
    </section>
  )
}

export default JournalStrip
