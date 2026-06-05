import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  buildMetadata,
  getAllArticlesMetadata,
  getUsedTags,
} from '@/lib/article-path'
import { buildHeatmapGrid, isoWeek } from '@/lib/date-utils'
import SocialMediaButton from '@/components/SocialMediaButton'

export async function generateMetadata(): Promise<Metadata> {
  const { authors } = await buildMetadata()
  const author = authors['kochie']
  return {
    title: 'About',
    description: author.bio,
    alternates: { canonical: '/about' },
    openGraph: {
      type: 'profile',
      url: '/about',
      title: 'About | Kochie Engineering',
      description: author.bio,
      siteName: 'Kochie Engineering',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About | Kochie Engineering',
      description: author.bio,
    },
  }
}

const HEATMAP_START_YEAR = 2021

function heatmapClass(count: number): string {
  if (count === 0) return 'bg-[var(--color-surface)]'
  if (count === 1) return 'bg-accent/25'
  if (count === 2) return 'bg-accent/60'
  return 'bg-accent'
}

function firstIsoWeekOfMonth(year: number, month: number): number {
  return isoWeek(new Date(Date.UTC(year, month, 1))).week
}

function isoWeekMonday(year: number, week: number): Date {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = (jan4.getUTCDay() + 6) % 7 // 0=Mon, 6=Sun
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + (week - 1) * 7)
  return monday
}

function isoWeeksInYear(year: number): number {
  const jan1Day = (new Date(Date.UTC(year, 0, 1)).getUTCDay() + 6) % 7 // 0=Mon
  const dec31Day = (new Date(Date.UTC(year, 11, 31)).getUTCDay() + 6) % 7
  return jan1Day === 3 || dec31Day === 3 ? 53 : 52
}

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export default async function AboutPage() {
  const [{ authors, tags, about }, allArticles] = await Promise.all([
    buildMetadata(),
    getAllArticlesMetadata(),
  ])

  const author = authors['kochie']
  const featuredSlugs = about?.featuredArticles ?? []

  // Featured articles — in the order declared in YAML
  const featuredArticles = featuredSlugs
    .map((slug) => allArticles.find((a) => a.articleDir === slug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined)

  // Recent articles — newest first, excluding featured
  // getAllArticlesMetadata() already returns articles sorted by publishedDate descending
  const featuredSet = new Set(featuredSlugs)
  const recentArticles = allArticles
    .filter((a) => !featuredSet.has(a.articleDir))
    .slice(0, 3)

  // Writing themes — top 6 tags by article count
  const themes = getUsedTags(allArticles, tags).slice(0, 6)

  // Heatmap grid
  const currentYear = new Date().getFullYear()
  const grid = buildHeatmapGrid(allArticles, HEATMAP_START_YEAR, currentYear)
  const years = Array.from(
    { length: currentYear - HEATMAP_START_YEAR + 1 },
    (_, i) => HEATMAP_START_YEAR + i
  )

  // Month labels computed once from the current year for the shared bottom axis
  const bottomMonthLabels: { month: number; col: number }[] = []
  for (let m = 0; m < 12; m++) {
    const col = firstIsoWeekOfMonth(currentYear, m)
    const prev = bottomMonthLabels[bottomMonthLabels.length - 1]
    if (!prev || col - prev.col >= 3) {
      bottomMonthLabels.push({ month: m, col })
    }
  }

  // ProfilePage JSON-LD
  const sameAs = [
    'https://me.kochie.io',
    ...author.socialMedia
      .map((sm) => sm.link)
      .filter((link) => !link.startsWith('mailto:')),
  ]
  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.fullName,
      url: 'https://blog.kochie.io/about',
      description: author.bio,
      sameAs,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />

      <main>
        {/* ── Prose: header + bio ── */}
        <div className="mx-auto max-w-prose px-4 pt-16">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-8 border-b border-rule">
            <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden ring-1 ring-rule">
              <Image
                fill
                sizes="80px"
                src={`/images/authors/${author.avatar.src}`}
                alt={`${author.fullName} portrait`}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif font-semibold text-h2 text-text leading-tight mb-1">
                {author.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-soft font-mono mb-3">
                <span>Software Engineer · Melbourne</span>
                <a
                  href="https://me.kochie.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  me.kochie.io ↗
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-text-soft">
                {author.socialMedia.map((sm) => (
                  <SocialMediaButton sm={sm} key={sm.name} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Bio ── */}
          <p className="font-serif text-base text-text-mute leading-relaxed mt-8 mb-10">
            {author.bio}
          </p>
        </div>

        {/* ── Writing History heatmap — full width, centered ── */}
        <section className="mb-10">
          {/* Title aligns with prose content */}
          <div className="mx-auto max-w-prose px-4 mb-4">
            <div className="font-mono text-meta text-text-soft tracking-wide">
              <span className="text-accent mr-2">{'// '}</span>
              WRITING HISTORY
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-4 sm:px-8">
            {/* Year rows — cells only, no per-row month labels */}
            <div>
              {years.map((year) => {
                const yearMap = grid.get(year) ?? new Map<number, number>()
                return (
                  <div
                    key={year}
                    className="flex items-center mb-1"
                    style={{ gap: '3px' }}
                  >
                    <span className="text-[10px] text-text-soft font-mono w-8 shrink-0 text-right pr-1">
                      {year}
                    </span>
                    {Array.from(
                      { length: isoWeeksInYear(year) },
                      (_, i) => i + 1
                    ).map((w) => {
                      const count = yearMap.get(w) ?? 0
                      const monday = isoWeekMonday(year, w)
                      const dateStr = monday.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })
                      const tooltipLabel = `Week of ${dateStr}: ${count} ${count === 1 ? 'article' : 'articles'}`
                      return (
                        <div
                          key={w}
                          className={`relative group/cell w-[13px] h-[13px] shrink-0 rounded-[2px] ring-1 ring-inset ring-white/[0.07] hover:ring-accent/50 hover:brightness-125 transition-colors cursor-default ${heatmapClass(count)}`}
                        >
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-[#111] px-1.5 py-0.5 font-mono text-[9px] text-text-soft opacity-0 transition-opacity group-hover/cell:opacity-100">
                            {tooltipLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              {/* Single month axis at the bottom */}
              <div className="flex items-start mt-1" style={{ gap: '3px' }}>
                <span className="text-[10px] text-text-soft font-mono w-8 shrink-0 text-right pr-1" />
                {Array.from(
                  { length: isoWeeksInYear(currentYear) },
                  (_, i) => i + 1
                ).map((w) => {
                  const label = bottomMonthLabels.find((ml) => ml.col === w)
                  return (
                    <div
                      key={w}
                      className="w-[13px] shrink-0 text-[9px] text-text-soft font-mono leading-none text-center"
                    >
                      {label ? MONTH_ABBR[label.month] : ''}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-text-soft font-mono">
              <span>Less</span>
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-[11px] h-[11px] rounded-[2px] ${heatmapClass(level)}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </section>

        {/* ── Prose: themes + articles ── */}
        <div className="mx-auto max-w-prose px-4 pb-16">
          {/* ── Writing Themes ── */}
          <section className="mb-10">
            <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
              <span className="text-accent mr-2">{'// '}</span>
              WRITING THEMES
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="font-mono text-xs px-2.5 py-1 border border-rule rounded text-text-soft hover:text-text hover:border-accent transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </section>

          {/* ── Selected Writing ── */}
          <section className="mb-10">
            <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
              <span className="text-accent mr-2">{'// '}</span>
              SELECTED WRITING
            </div>
            <div className="divide-y divide-rule">
              {featuredArticles.map((article) => (
                <ArticleRow key={article.articleDir} article={article} />
              ))}
            </div>
          </section>

          {/* ── Recent Writing ── */}
          <section className="mb-10">
            <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
              <span className="text-accent mr-2">{'// '}</span>
              RECENT WRITING
            </div>
            <div className="divide-y divide-rule">
              {recentArticles.map((article) => (
                <ArticleRow key={article.articleDir} article={article} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

type ArticleRowProps = {
  article: {
    articleDir: string
    title: string
    publishedDate: string
    tags: string[]
    jumbotron: { url: string; alt: string; lqip: string }
  }
}

function ArticleRow({ article }: ArticleRowProps) {
  const date = new Date(article.publishedDate).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return (
    <Link
      href={`/articles/${article.articleDir}`}
      className="flex gap-3 py-3 group items-start hover:opacity-80 transition-opacity"
    >
      <div className="relative w-14 h-10 shrink-0 rounded overflow-hidden bg-surface">
        <Image
          fill
          sizes="56px"
          src={article.jumbotron.url}
          alt={article.jumbotron.alt}
          placeholder={article.jumbotron.lqip ? 'blur' : 'empty'}
          blurDataURL={article.jumbotron.lqip || undefined}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-serif text-sm text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </div>
        <div className="font-mono text-[10px] text-text-mute mt-0.5">
          {date}
          {article.tags[0] && (
            <span className="ml-2 text-text-soft">{article.tags[0]}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
