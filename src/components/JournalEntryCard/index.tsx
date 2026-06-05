import Link from 'next/link'
import type { JournalEntry } from '@/lib/journal-path'

interface JournalEntryCardProps {
  entry: JournalEntry
  compact?: boolean
  children?: React.ReactNode
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

function firstSentence(body: string, maxChars = 120): string {
  const stripped = body.replace(/!\[.*?\]\(.*?\)/g, '').trim()
  const first = stripped.split(/\.\s/)[0]
  if (first.length <= maxChars) return first.endsWith('.') ? first : `${first}.`
  return `${first.slice(0, maxChars).trimEnd()}…`
}

export function JournalEntryCard({
  entry,
  compact = false,
  children,
}: JournalEntryCardProps) {
  if (compact) {
    return (
      <div id={entry.slug} className="border-l-[3px] border-accent pl-4">
        <Link
          href={`/journal/${entry.slug}`}
          className="font-mono text-sm text-accent hover:underline block mb-1"
        >
          {formatDate(entry.slug)}
        </Link>
        <p className="text-sm text-text-mute leading-relaxed">
          {firstSentence(entry.body)}
        </p>
      </div>
    )
  }

  return (
    <div id={entry.slug}>
      <Link
        href={`/journal/${entry.slug}`}
        className="font-mono text-xs tracking-widest text-text-soft uppercase hover:text-accent block mb-6"
      >
        {formatFullDate(entry.slug)}
      </Link>
      <div className="flow-root prose prose-sm text-text leading-relaxed mb-6 [&_p]:max-w-none [&_p+p]:mt-4 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-75 [&_code]:font-mono [&_code]:bg-bg-soft [&_code]:px-1 [&_code]:rounded-sm [&_img]:block [&_img]:max-w-[calc(100%-3rem)] [&_img]:mx-auto [&_img]:my-6 [&_img]:rounded-sm sm:[&_img]:float-right sm:[&_img]:w-1/2 sm:[&_img]:max-w-none sm:[&_img]:mx-0 sm:[&_img]:ml-6 sm:[&_img]:my-0 sm:[&_img]:mb-2">
        {children}
      </div>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
    </div>
  )
}

export default JournalEntryCard
