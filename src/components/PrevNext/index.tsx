import React from 'react'
import Link from 'next/link'
import type { ArticleMetadata } from '@/lib/article-path'

interface PrevNextProps {
  prev: ArticleMetadata | null
  next: ArticleMetadata | null
}

const Card = ({
  article,
  label,
  alignRight,
}: {
  article: ArticleMetadata
  label: 'Newer essay' | 'Older essay'
  alignRight?: boolean
}) => (
  <Link
    href={`/articles/${article.articleDir}`}
    className={[
      'group block max-w-prose w-full p-5',
      'border border-rule rounded-md',
      'bg-bg-soft hover:bg-bg-deep transition-colors duration-fast',
      alignRight ? 'text-right' : 'text-left',
    ].join(' ')}
  >
    <div className="font-mono text-meta text-text-soft tracking-wide mb-2">
      {alignRight ? '→ ' : '← '}
      {label}
    </div>
    <div className="font-serif text-h3 text-text group-hover:text-accent transition-colors duration-fast">
      {article.title}
    </div>
  </Link>
)

/**
 * Prev/next article navigation. Renders nothing if both are null (so the
 * single oldest + newest articles get a clean foot). Order mirrors a
 * publication archive — "Newer" on the left, "Older" on the right.
 */
const PrevNext = ({ prev, next }: PrevNextProps): React.ReactElement | null => {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Adjacent essays"
      className="mx-auto max-w-bleed grid grid-cols-1 md:grid-cols-2 gap-4 my-16 px-4"
    >
      {prev ? <Card article={prev} label="Newer essay" /> : <div aria-hidden />}
      {next ? (
        <Card article={next} label="Older essay" alignRight />
      ) : (
        <div aria-hidden />
      )}
    </nav>
  )
}

export default PrevNext
