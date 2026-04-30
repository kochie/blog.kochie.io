import React, { type PropsWithChildren } from 'react'
import { FigureProvider } from '@/components/Figure/context'
import Figure from '@/components/Figure'
import ScrollProgress from '@/components/ScrollProgress'
import TOCSidebar from '@/components/TOCSidebar'
import PrevNext from '@/components/PrevNext'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'
import Image from 'next/image'

/**
 * Extract the leading numeric prefix from an articleDir like "13-lambda-recursion".
 * Returns null when the dir does not start with digits.
 * (Inlined from lib/article-path to avoid pulling the server-only module into client bundles.)
 */
const getArticleNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  if (!match) return null
  return parseInt(match[1], 10)
}

/**
 * The "updated" line only renders when the edit lands at least 14 days after publication.
 * (Inlined from lib/article-path to avoid pulling the server-only module into client bundles.)
 */
const shouldShowUpdatedDate = (
  publishedDate: string,
  editedDate: string
): boolean => {
  const published = new Date(publishedDate).getTime()
  const edited = new Date(editedDate).getTime()
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
  return edited - published >= fourteenDaysMs
}

interface ArticleProps {
  article: ArticleMetadata
  author: Author
  prev?: ArticleMetadata | null
  next?: ArticleMetadata | null
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()

const Kicker = ({ article }: { article: ArticleMetadata }) => {
  const num = getArticleNumber(article.articleDir)
  const tags = article.tags.slice(0, 2)
  return (
    <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
      {num !== null ? (
        <span className="text-accent mr-2">
          {'// '}
          {String(num).padStart(2, '0')}
        </span>
      ) : null}
      {tags.map((tag, i) => (
        <span key={tag}>
          {i > 0 ? <span className="mx-1 text-text-soft">·</span> : null}
          <span className="uppercase">{tag}</span>
        </span>
      ))}
    </div>
  )
}

const MetaLine = ({
  article,
  author,
}: {
  article: ArticleMetadata
  author: Author
}) => {
  const showUpdated = shouldShowUpdatedDate(
    article.publishedDate,
    article.editedDate
  )
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-meta text-text-soft tracking-wide pb-8 border-b border-rule">
      <span className="font-serif italic text-text">By {author.fullName}</span>
      <span aria-hidden className="text-text-soft">
        ·
      </span>
      <span>{formatDate(article.publishedDate)}</span>
      <span aria-hidden className="text-text-soft">
        ·
      </span>
      <span>{article.readTime.toUpperCase()}</span>
      {showUpdated ? (
        <>
          <span aria-hidden className="text-text-soft">
            ·
          </span>
          <span>UPDATED {formatDate(article.editedDate)}</span>
        </>
      ) : null}
    </div>
  )
}

const HeroFigure = ({ article }: { article: ArticleMetadata }) => {
  if (!article.jumbotron?.url || !article.jumbotron?.alt) return null
  return (
    <div className="my-10">
      <Figure kind="image" tier="bleed" caption={article.jumbotron.alt}>
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          <Image
            src={article.jumbotron.url}
            alt={article.jumbotron.alt}
            fill
            sizes="(max-width: 1280px) 100vw, 1080px"
            blurDataURL={article.jumbotron.lqip}
            placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
            style={{ objectFit: 'cover' }}
          />
        </div>
      </Figure>
    </div>
  )
}

const Article = ({
  article,
  author,
  prev = null,
  next = null,
  children,
}: PropsWithChildren<ArticleProps>): React.ReactElement => {
  return (
    <article className="bg-bg text-text">
      <ScrollProgress />

      {/* Article opening: kicker → H1 → deck → meta */}
      <header className="mx-auto max-w-prose px-4 pt-16 pb-4">
        <Kicker article={article} />
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          {article.title}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-6">
          {article.blurb}
        </p>
        <MetaLine article={article} author={author} />
      </header>

      <FigureProvider>
        {/* Optional hero figure */}
        <div className="mx-auto max-w-bleed px-4">
          <HeroFigure article={article} />
        </div>

        {/* Body — TOC sidebar on xl+, prose on the right */}
        <div className="mx-auto max-w-bleed px-4 grid grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden xl:block pt-6">
            <TOCSidebar containerSelector="article [data-mdx-body]" />
          </aside>

          <div data-mdx-body className="max-w-prose mx-auto xl:mx-0 pt-6">
            {children}
          </div>
        </div>
      </FigureProvider>

      <PrevNext prev={prev} next={next} />
    </article>
  )
}

export default Article
export { Article }
