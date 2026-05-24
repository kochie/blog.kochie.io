import Link from 'next/link'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalEntryCardProps {
  entry: JournalEntry
  compact?: boolean
}

function formatDate(slug: string): string {
  const [year, month, day] = slug.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function firstSentence(body: string, maxChars = 120): string {
  const first = body.split(/\.\s/)[0]
  if (first.length <= maxChars) return first.endsWith('.') ? first : `${first}.`
  return `${first.slice(0, maxChars).trimEnd()}…`
}

export function JournalEntryCard({
  entry,
  compact = false,
}: JournalEntryCardProps) {
  return (
    <div id={entry.slug} className="border-l-[3px] border-accent pl-4">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <Link
          href={`/journal/${entry.slug}`}
          className="font-mono text-sm text-accent hover:underline shrink-0"
        >
          {formatDate(entry.slug)}
        </Link>
        {!compact && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-accent border border-accent/40 px-1.5 py-0.5 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {compact ? (
        <p className="text-sm text-text-mute leading-relaxed">
          {firstSentence(entry.body)}
        </p>
      ) : (
        <div
          className="prose prose-sm text-text leading-relaxed [&_code]:font-mono [&_code]:bg-bg-soft [&_code]:px-1 [&_code]:rounded-sm"
          dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
        />
      )}
    </div>
  )
}

export default JournalEntryCard
