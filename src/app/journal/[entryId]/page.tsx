import { notFound } from 'next/navigation'
import { getEntries, getEntryBySlug } from '@/lib/journal-path'
import { compileJournalMdx } from '@/lib/compile-journal-mdx'
import { JournalEntryPage } from '@/components/JournalEntryPage'
import type { Metadata } from 'next'
import { components } from '@/components/MDXWrapper/components'

interface Props {
  params: Promise<{ entryId: string }>
}

export async function generateStaticParams() {
  const entries = await getEntries()
  return entries.map((e) => ({ entryId: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params
  const entry = await getEntryBySlug(entryId)
  if (!entry) return {}
  const [year, month, day] = entry.slug.split('-').map(Number)
  const date = new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const description = entry.bodyHtml.replace(/<[^>]+>/g, '').slice(0, 160)
  const title = `Journal — ${date} — Kochie Engineering`
  return {
    title,
    description,
    alternates: {
      canonical: `/journal/${entryId}`,
    },
    openGraph: {
      type: 'article',
      url: `/journal/${entryId}`,
      title,
      description,
      siteName: 'Kochie Engineering',
      publishedTime: entry.date,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function JournalEntryRoute({ params }: Props) {
  const { entryId } = await params
  const [entry, allEntries] = await Promise.all([
    getEntryBySlug(entryId),
    getEntries(),
  ])

  if (!entry) notFound()

  const related = allEntries
    .filter(
      (e) => e.slug !== entry.slug && e.tags.some((t) => entry.tags.includes(t))
    )
    .slice(0, 3)

  const MDXContent = await compileJournalMdx(entry.body)

  return (
    <main className="bg-bg text-text">
      <JournalEntryPage entry={entry} related={related}>
        <MDXContent components={components} />
      </JournalEntryPage>
    </main>
  )
}
