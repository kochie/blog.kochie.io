import { ImageResponse } from 'next/og'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog · Archive'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  const articles = await getAllArticlesMetadata()

  return new ImageResponse(
    <FieldJournalOG
      kicker="ARCHIVE"
      title="Every essay, by year."
      deck="The full Kochie Engineering / Blog index — long-form software, maths, and field notes from Melbourne."
      meta="KOCHIE ENGINEERING / BLOG"
      badge={`${articles.length} ESSAYS`}
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
