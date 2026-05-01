import React, { type PropsWithChildren } from 'react'
import { FigureProvider } from '@/components/Figure/context'
import Figure from '@/components/Figure'
import ScrollProgress from '@/components/ScrollProgress'
import TOCSidebar from '@/components/TOCSidebar'
import PodcastPlayer from '@/components/PodcastPlayer'
import type { ArticleMetadata } from '@/lib/article-path'
import type { Author } from 'types/metadata'
import Image from 'next/image'
import type { ProjectContext } from '@/lib/project-path'
import ProjectKicker from '@/components/ProjectKicker'
import ProjectBanner from '@/components/ProjectBanner'

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
  projectContext?: ProjectContext | null
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()

const Kicker = ({
  article,
  projectContext,
}: {
  article: ArticleMetadata
  projectContext?: ProjectContext | null
}) => {
  const num = getArticleNumber(article.articleDir)
  const tags = article.tags.slice(0, 2)
  // Spec §9.2: `// {number} · {top tag} · {secondary tag}` — the dots
  // appear between every kicker fragment, not just between tags.
  const showLeadingDot = num !== null && (projectContext || tags.length > 0)
  return (
    <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
      {num !== null ? (
        <span className="text-accent">
          {'// '}
          {String(num).padStart(2, '0')}
        </span>
      ) : null}
      {showLeadingDot ? <span className="mx-2 text-text-soft">·</span> : null}
      {projectContext ? (
        <>
          <ProjectKicker
            projectSlug={projectContext.project.slug}
            projectTitle={projectContext.project.title}
            chapter={projectContext.chapter}
          />
          {tags.length > 0 ? (
            <span className="mx-2 text-text-soft">·</span>
          ) : null}
        </>
      ) : null}
      {tags.map((tag, i) => (
        <span key={tag}>
          {i > 0 ? <span className="mx-2 text-text-soft">·</span> : null}
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
      {/* The hero uses next/image's `fill` mode inside an aspect-ratio
          container, which needs the frame to span the bleed tier. Inline
          MDX images use the default `fit` frame. */}
      <Figure
        kind="image"
        tier="bleed"
        frame="fill"
        caption={article.jumbotron.alt}
      >
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
  projectContext,
  children,
}: PropsWithChildren<ArticleProps>): React.ReactElement => {
  return (
    <article className="bg-bg text-text overflow-x-clip">
      <ScrollProgress />

      {/* Article opening: kicker → H1 → deck → meta → optional listen */}
      <header className="mx-auto max-w-prose px-4 pt-16 pb-4">
        <Kicker article={article} projectContext={projectContext} />
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          {article.title}
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-6">
          {article.blurb}
        </p>
        <MetaLine article={article} author={author} />
        {projectContext ? (
          <ProjectBanner
            projectSlug={projectContext.project.slug}
            projectTitle={projectContext.project.title}
            chapter={projectContext.chapter}
            total={projectContext.project.members.length}
          />
        ) : null}
        {article.podcast ? (
          <PodcastPlayer
            audio={article.podcast.audio}
            duration={article.podcast.duration}
            title={article.title}
          />
        ) : null}
      </header>

      <FigureProvider>
        {/* Optional hero figure */}
        <div className="mx-auto max-w-bleed px-4">
          <HeroFigure article={article} />
        </div>

        {/* Body — symmetric 3-col grid [TOC | content | spacer]. The
            spacer mirrors the TOC's width so the content column stays
            page-centered, which keeps prose centred on the page. Prose
            elements self-apply max-w-prose (in MDXWrapper) and centre
            within the content column; wide figures fit inside the column
            via mx-auto max-w-wide; bleed figures use a viewport-breakout
            pattern to escape the column. The article element clips
            horizontal overflow so w-screen doesn't introduce a scrollbar. */}
        <div className="mx-auto max-w-site px-4 xl:grid xl:grid-cols-[14rem_minmax(0,1fr)_14rem] xl:gap-4">
          <aside className="hidden xl:block pt-6">
            <TOCSidebar containerSelector="article [data-mdx-body]" />
          </aside>

          <div data-mdx-body className="min-w-0 pt-6">
            {children}
          </div>

          <div aria-hidden className="hidden xl:block" />
        </div>
      </FigureProvider>
    </article>
  )
}

export default Article
export { Article }
