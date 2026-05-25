import { ImageResponse } from 'next/og'
import { getAllProjectManifests } from '@/lib/project-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog · Projects'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  const manifests = await getAllProjectManifests()

  return new ImageResponse(
    <FieldJournalOG
      kicker="PROJECTS"
      title="Projects."
      deck="Ongoing series and bodies of work — collections of shorter chapters that tell a longer story."
      meta="KOCHIE ENGINEERING / BLOG"
      badge={`${manifests.length} ${manifests.length === 1 ? 'PROJECT' : 'PROJECTS'}`}
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
