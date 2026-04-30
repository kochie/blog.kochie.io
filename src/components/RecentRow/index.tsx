import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMetadata } from '@/lib/article-path'

interface RecentRowProps {
  articles: ArticleMetadata[]
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatMonthYear = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

const Thumbnail = ({ article }: { article: ArticleMetadata }) => {
  const num = getNumber(article.articleDir)
  return (
    <div
      className="relative w-full bg-bg-deep border border-rule rounded-md overflow-hidden"
      style={{ aspectRatio: '16 / 10' }}
    >
      {article.jumbotron?.url ? (
        <Image
          src={article.jumbotron.url}
          alt={article.jumbotron.alt ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          blurDataURL={article.jumbotron.lqip}
          placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
          style={{ objectFit: 'cover' }}
        />
      ) : num !== null ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif font-semibold text-[6rem] text-accent leading-none">
            {String(num).padStart(2, '0')}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * 3-card recent-essays row. Each card: thumbnail / number / title / blurb /
 * meta. Pulls thumbnail from the article's jumbotron; falls back to a big
 * mono number against bg-bg-deep when there's no jumbotron.
 *
 * Spec §9.1 step 3.
 */
const RecentRow = ({
  articles,
}: RecentRowProps): React.ReactElement | null => {
  if (articles.length === 0) return null
  return (
    <section className="mx-auto max-w-bleed px-4 py-12">
      <div className="flex items-baseline justify-between mb-6 font-mono text-meta tracking-wide">
        <span className="text-text-soft">
          {'// '}
          <span className="text-accent">RECENT</span>
          {' · also worth your time'}
        </span>
        <Link
          href="#archive"
          className="font-serif italic text-text-mute hover:text-accent transition-colors duration-fast"
        >
          See the archive →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const num = getNumber(article.articleDir)
          return (
            <Link
              key={article.articleDir}
              href={`/articles/${article.articleDir}`}
              className="group block"
            >
              <Thumbnail article={article} />
              <div className="mt-3 font-mono text-meta text-accent tracking-wide">
                {num !== null ? `// ${String(num).padStart(2, '0')}` : ''}
              </div>
              <h3 className="font-serif font-semibold text-h3 text-text leading-tight mt-1 group-hover:text-accent transition-colors duration-fast">
                {article.title}
              </h3>
              <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-2 line-clamp-3">
                {article.blurb}
              </p>
              <div className="font-mono text-meta text-text-soft tracking-wide mt-3">
                {article.readTime.toUpperCase()} ·{' '}
                {formatMonthYear(article.publishedDate)}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default RecentRow
