import React from 'react'
import Link from 'next/link'
import type { ArticleMetadata } from '@/lib/article-path'

interface ArchiveListProps {
  articles: ArticleMetadata[]
  /**
   * Optional id for the section element. Used to anchor "See the archive →"
   * links from above.
   */
  id?: string
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatMonthYear = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

interface YearGroup {
  year: string
  articles: ArticleMetadata[]
}

const groupByYear = (articles: ArticleMetadata[]): YearGroup[] => {
  const groups = new Map<string, ArticleMetadata[]>()
  for (const article of articles) {
    const year = String(new Date(article.publishedDate).getFullYear())
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(article)
  }
  // Map preserves insertion order; since input is sorted desc, years are too.
  return Array.from(groups.entries()).map(([year, group]) => ({
    year,
    articles: group,
  }))
}

/**
 * Year-grouped numbered archive list. Each row: number / title + blurb /
 * tags / read-time + date. Used on the homepage and (in Phase 5) on the
 * standalone /archive page.
 *
 * Spec §9.1 step 4 and §9.3.
 */
const ArchiveList = ({
  articles,
  id = 'archive',
}: ArchiveListProps): React.ReactElement | null => {
  if (articles.length === 0) return null
  const groups = groupByYear(articles)
  return (
    <section id={id} className="mx-auto max-w-bleed px-4 py-12">
      <div className="font-mono text-meta tracking-wide text-text-soft mb-6">
        {'// '}
        <span className="text-accent">ARCHIVE</span>
        {' · all essays, by year'}
      </div>
      {groups.map((group) => (
        <div key={group.year} data-year={group.year} className="mb-10">
          <div className="font-mono text-meta tracking-wide text-text-soft mb-3 pb-2 border-b border-rule">
            {'// '}
            {group.year}
          </div>
          <ol className="list-none">
            {group.articles.map((article) => {
              const num = getNumber(article.articleDir)
              return (
                <li
                  key={article.articleDir}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_auto_auto] gap-4 items-baseline py-3 border-b border-rule/50 last:border-b-0"
                >
                  <span className="font-mono text-meta text-accent tracking-wide">
                    {num !== null ? `// ${String(num).padStart(2, '0')}` : ''}
                  </span>
                  <div>
                    <Link
                      href={`/articles/${article.articleDir}`}
                      className="font-serif font-semibold text-text hover:text-accent transition-colors duration-fast"
                    >
                      {article.title}
                    </Link>
                    {article.blurb ? (
                      <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-1">
                        {article.blurb}
                      </p>
                    ) : null}
                  </div>
                  <span className="font-mono text-meta text-text-soft tracking-wide hidden md:inline">
                    {article.tags.slice(0, 2).join(' · ')}
                  </span>
                  <span className="font-mono text-meta text-text-soft tracking-wide whitespace-nowrap">
                    {article.readTime.toUpperCase()} ·{' '}
                    {formatMonthYear(article.publishedDate)}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </section>
  )
}

export default ArchiveList
