import Link from 'next/link'

export interface FeedEntry {
  slug: string
  tags: string[]
  node: React.ReactNode
}

export interface FeedGroup {
  label: string
  entries: FeedEntry[]
}

interface JournalFeedProps {
  groups: FeedGroup[]
  allTags: string[]
  activeTag: string | null
}

export function JournalFeed({ groups, allTags, activeTag }: JournalFeedProps) {
  return (
    <div>
      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-rule">
        <span className="font-mono text-xs text-text-soft self-center mr-1">
          {'// FILTER'}
        </span>
        <Link
          href="/journal"
          scroll={false}
          className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
            !activeTag
              ? 'bg-accent text-bg'
              : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
          }`}
        >
          all
        </Link>
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={activeTag === tag ? '/journal' : `/journal?tag=${tag}`}
            scroll={false}
            className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
              activeTag === tag
                ? 'bg-accent text-bg'
                : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Month groups */}
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="font-mono text-2xl text-accent mb-6">
              {group.label}
            </h2>
            <div className="divide-y divide-rule">
              {group.entries.map((entry) => (
                <div key={entry.slug} className="py-10 first:pt-0">
                  {entry.node}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default JournalFeed
