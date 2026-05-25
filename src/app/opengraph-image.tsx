import { ImageResponse } from 'next/og'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  return new ImageResponse(
    <FieldJournalOG
      kicker="FIELD JOURNAL"
      title="Kochie Engineering / Blog."
      deck="Field notes from a one-person engineering studio. Software, mostly. Sometimes maths."
      meta="By Robert Koch · Melbourne · since 2020"
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
