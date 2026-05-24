import Link from 'next/link'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalEntryPageProps {
  entry: JournalEntry
  related: JournalEntry[]
}

function formatFullDate(slug: string): string {
  const [year, month, day] = slug.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function JournalEntryPage({ entry, related }: JournalEntryPageProps) {
  return (
    <article className="mx-auto max-w-prose px-4 py-16">
      {/* Back link */}
      <Link
        href={`/journal#${entry.slug}`}
        className="font-mono text-xs text-text-soft hover:text-accent mb-8 block"
      >
        ← back to journal
      </Link>

      {/* Date heading */}
      <h1 className="font-mono text-accent text-2xl mb-6">
        {formatFullDate(entry.slug)}
      </h1>

      {/* Rendered body */}
      <div
        className="prose prose-sm text-text leading-relaxed mb-6 [&_code]:font-mono [&_code]:bg-bg-soft [&_code]:px-1 [&_code]:rounded-sm"
        dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
      />

      {/* Tag chips */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {entry.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="font-mono text-xs text-accent border border-accent/40 px-2 py-0.5 rounded-sm hover:bg-accent hover:text-bg transition-colors duration-fast"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Prev/Next navigation */}
      <nav
        className="flex justify-between border-t border-rule pt-8 mb-12"
        aria-label="Entry navigation"
      >
        {entry.prev ? (
          <Link
            href={`/journal/${entry.prev}`}
            className="font-mono text-xs text-text-mute hover:text-accent"
          >
            ← {entry.prev}
          </Link>
        ) : (
          <span />
        )}
        {entry.next ? (
          <Link
            href={`/journal/${entry.next}`}
            className="font-mono text-xs text-text-mute hover:text-accent"
          >
            {entry.next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Related entries */}
      {related.length > 0 && (
        <section>
          <div className="font-mono text-xs text-text-soft mb-6">
            {'// RELATED ENTRIES'}
          </div>
          <div className="space-y-6">
            {related.map((r) => (
              <JournalEntryCard key={r.slug} entry={r} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default JournalEntryPage
