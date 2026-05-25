import { ImageResponse } from 'next/og'
import { getAllArticlesMetadata, getUsedTags } from '@/lib/article-path'
import { FieldJournalOG, OG_SIZE } from '@/lib/og-template'
import { loadFieldJournalFonts } from '@/lib/og-fonts'
import metadata from '$metadata'
import type { Tag } from 'types/metadata'

export const alt = 'Kochie Engineering / Blog · Tags'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function og() {
  const articles = await getAllArticlesMetadata()
  const tags = getUsedTags(articles, metadata.tags as Tag[])

  return new ImageResponse(
    <FieldJournalOG
      kicker="TAGS"
      title="All tags."
      deck={`${tags.length} ways to slice the archive — pick a tag, follow the thread.`}
      meta="KOCHIE ENGINEERING / BLOG"
      badge={`${articles.length} ESSAYS`}
    />,
    {
      ...size,
      fonts: await loadFieldJournalFonts(),
    }
  )
}
