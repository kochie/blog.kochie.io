import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'

interface HeroFeatureProps {
  article: ArticleMetadata
  author: Author
}

const getNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
    .toUpperCase()

/**
 * Top-of-homepage hero. Oversized serif headline, italic deck, mono kicker,
 * mono meta, clay-bordered "Read the essay →" CTA. Hero figure on the right
 * if the article has a jumbotron; typographic fallback otherwise.
 *
 * Spec §9.1 step 2: "1.4:1 grid; text on the left, figure on the right;
 * full-width on mobile."
 */
const HeroFeature = ({
  article,
  author,
}: HeroFeatureProps): React.ReactElement => {
  const num = getNumber(article.articleDir)
  const tags = article.tags.slice(0, 3).map((t) => t.toUpperCase())
  return (
    <section className="mx-auto max-w-bleed px-4 py-16 grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 items-center">
      <div>
        {/* Single coherent kicker: clay slash, signal "THIS WEEK" badge,
            then `· {number} · {tags}`. Avoids the previous double-`//`
            stutter of "// THIS WEEK   // 13 …". */}
        <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
          <span className="text-accent">{'// '}</span>
          <span className="text-signal">THIS WEEK</span>
          {num !== null ? (
            <>
              <span className="mx-2 text-text-soft">·</span>
              <span className="text-accent">
                {String(num).padStart(2, '0')}
              </span>
            </>
          ) : null}
          {tags.length > 0 ? (
            <>
              <span className="mx-2 text-text-soft">·</span>
              {tags.join(' · ')}
            </>
          ) : null}
        </div>
        <h1 className="font-serif font-semibold text-display-hero text-text leading-none tracking-tight mb-5">
          {article.title}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-7 max-w-prose">
          {article.blurb}
        </p>
        <div className="font-mono text-meta text-text-soft tracking-wide mb-7 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-serif italic text-text">
            By {author.fullName}
          </span>
          <span aria-hidden>·</span>
          <span>{article.readTime.toUpperCase()}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(article.publishedDate)}</span>
        </div>
        <Link
          href={`/articles/${article.articleDir}`}
          className="inline-flex items-center gap-2 px-5 py-3 border border-accent rounded-md text-text font-serif italic text-base hover:bg-accent hover:text-bg transition-colors duration-fast"
        >
          Read the essay <span className="text-accent">→</span>
        </Link>
      </div>

      <div
        aria-hidden={!article.jumbotron?.alt}
        className="relative w-full bg-bg-deep border border-rule rounded-md overflow-hidden"
        style={{ aspectRatio: '4 / 3' }}
      >
        {article.jumbotron?.url ? (
          <Image
            src={article.jumbotron.url}
            alt={article.jumbotron.alt ?? ''}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            blurDataURL={article.jumbotron.lqip}
            placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
            style={{ objectFit: 'cover' }}
          />
        ) : num !== null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif font-semibold text-[10rem] text-accent leading-none">
              {String(num).padStart(2, '0')}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default HeroFeature
