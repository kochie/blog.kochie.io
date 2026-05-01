import { ImageResponse } from 'next/og'
import { buildProject, getProjectManifest } from '@/lib/project-path'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'

export const alt = 'Kochie Engineering / Blog'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let manifest
  try {
    manifest = await getProjectManifest(slug)
  } catch {
    return new Response('Project not found', { status: 404 })
  }

  const articles = await getAllArticlesMetadata()
  const project = await buildProject(slug, articles).catch(() => null)
  const chapters = project?.members.length ?? 0

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const bgImage = manifest.hero?.src
    ? `${baseUrl}/images/projects/${slug}/${manifest.hero.src}`
    : undefined

  const status = (manifest.status ?? 'ongoing').toUpperCase()

  return new ImageResponse(
    <FieldJournalOG
      kicker="PROJECT"
      title={manifest.title}
      deck={manifest.blurb}
      bgImage={bgImage}
      meta={`STATUS · ${status}`}
      badge={`${chapters} ${chapters === 1 ? 'CHAPTER' : 'CHAPTERS'}`}
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
