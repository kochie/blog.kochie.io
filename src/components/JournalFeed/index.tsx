'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { JournalEntryCard } from '@/components/JournalEntryCard'
import type { MonthGroup } from '@/lib/journal-path'

interface JournalFeedProps {
  groups: MonthGroup[]
  allTags: string[]
}

export function JournalFeed({ groups, allTags }: JournalFeedProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? null

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (tag && tag !== activeTag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    const qs = params.toString()
    router.replace(qs ? `/journal?${qs}` : '/journal', { scroll: false })
  }

  return (
    <div>
      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-rule">
        <span className="font-mono text-xs text-text-soft self-center mr-1">
          {'// FILTER'}
        </span>
        <button
          onClick={() => setTag(null)}
          className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
            !activeTag
              ? 'bg-accent text-bg'
              : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
          }`}
        >
          all
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setTag(tag)}
            className={`font-mono text-xs px-2 py-1 rounded-sm transition-colors duration-fast ${
              activeTag === tag
                ? 'bg-accent text-bg'
                : 'border border-rule text-text-mute hover:border-accent hover:text-accent'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Month groups */}
      <div className="space-y-12">
        {groups.map((group) => {
          const visible = activeTag
            ? group.entries.filter((e) => e.tags.includes(activeTag))
            : group.entries

          if (visible.length === 0) return null

          return (
            <section key={group.label}>
              <h2 className="font-mono text-2xl text-accent mb-6">
                {group.label}
              </h2>
              <div className="divide-y divide-rule">
                {visible.map((entry) => (
                  <div key={entry.slug} className="py-10 first:pt-0">
                    <JournalEntryCard entry={entry} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default JournalFeed
