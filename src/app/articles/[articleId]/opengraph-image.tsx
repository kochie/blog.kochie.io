import { ImageResponse } from 'next/og'
import { getArticleMatter, getArticleNumber } from '@/lib/article-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog'
export const size = OG_SIZE
export const contentType = 'image/png'

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()

export default async function og({
  params,
}: {
  params: Promise<{ articleId: string }>
}) {
  const { articleId } = await params

  // Read the article frontmatter directly — no JSON round-trip. The sync
  // matter reader is enough since OG cards only need title/blurb/tags/date.
  let article
  try {
    article = getArticleMatter(articleId)
  } catch {
    return new Response('Article not found', { status: 404 })
  }

  const num = getArticleNumber(articleId)
  const tag = (article.tags?.[0] ?? '').toUpperCase()
  const kicker = tag ? `· ${tag}` : 'FIELD JOURNAL'
  const kickerAccent = num !== null ? String(num).padStart(2, '0') : undefined

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  // The article's hero image, if it exists, becomes a low-opacity wash
  // behind the headline — keeps the card visually distinct per article.
  const bgImage = article.jumbotron?.url
    ? `${baseUrl}${article.jumbotron.url}`
    : undefined

  const meta = [
    `BY ${(article.author || 'KOCHIE').toUpperCase()}`,
    formatDate(article.publishedDate),
    article.readTime?.toUpperCase(),
  ]
    .filter(Boolean)
    .join('  ·  ')

  return new ImageResponse(
    <FieldJournalOG
      kicker={kicker}
      kickerAccent={kickerAccent}
      title={article.title}
      deck={article.blurb}
      meta={meta}
      bgImage={bgImage}
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
