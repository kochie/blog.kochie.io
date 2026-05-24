import { ImageResponse } from 'next/og'
import { getEntryBySlug } from '@/lib/journal-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Journal'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params
  const entry = await getEntryBySlug(entryId)

  if (!entry) {
    return new Response('Entry not found', { status: 404 })
  }

  const [year, month, day] = entry.slug.split('-').map(Number)
  const date = new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const excerpt = entry.body.slice(0, 120)

  return new ImageResponse(
    <FieldJournalOG
      kicker="JOURNAL"
      title={date}
      deck={excerpt}
      meta="blog.kochie.io/journal"
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
