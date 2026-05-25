import { ImageResponse } from 'next/og'
import { getAllArticlesMetadata, getUsedTags } from '@/lib/article-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'
import metadata from '$metadata'
import type { Tag } from 'types/metadata'

export const alt = 'Kochie Engineering / Blog'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og({
  params,
}: {
  params: Promise<{ tagId: string }>
}) {
  const { tagId } = await params

  // Use the same article-derived tag list the rest of the site uses, so an
  // OG image only renders for tags that actually carry essays.
  const articles = await getAllArticlesMetadata()
  const used = getUsedTags(articles, metadata.tags as Tag[])
  const tag = used.find((t) => t.slug === tagId.toLowerCase())
  if (!tag) return new Response('Tag not found', { status: 404 })

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  // metadata.yaml may declare a splash image for the tag; if it does we
  // wash it behind the headline. Otherwise the card stays clean warm soot.
  const bgImage = tag.image?.src
    ? `${baseUrl}/images/tags/${tag.image.src}`
    : undefined

  return new ImageResponse(
    <FieldJournalOG
      kicker="TAG"
      title={tag.name}
      deck={tag.blurb ?? `Essays tagged with ${tag.name}.`}
      bgImage={bgImage}
      badge={`${tag.articleCount} ${tag.articleCount === 1 ? 'ESSAY' : 'ESSAYS'}`}
      meta="KOCHIE ENGINEERING / BLOG"
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
