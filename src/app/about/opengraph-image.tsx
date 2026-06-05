import { ImageResponse } from 'next/og'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'About Robert Koch — Kochie Engineering'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  return new ImageResponse(
    <FieldJournalOG
      kicker="ABOUT"
      title="Robert Koch"
      deck="Software Engineer from Melbourne. Writing about engineering, maths, and technology."
      meta="KOCHIE ENGINEERING / BLOG"
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
