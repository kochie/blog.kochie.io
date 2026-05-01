import { ImageResponse } from 'next/og'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog · Field Manual'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  return new ImageResponse(
    (
      <FieldJournalOG
        kicker="FIELD MANUAL"
        title="A field journal."
        deck="Warm Melbourne, not SF gloss. The brief behind the redesign — palette, typography, motifs, motion."
        meta="KOCHIE ENGINEERING / BLOG"
      />
    ),
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
