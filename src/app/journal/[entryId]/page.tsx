import { notFound } from 'next/navigation'
import { getEntries, getEntryBySlug } from '@/lib/journal-path'
import { JournalEntryPage } from '@/components/JournalEntryPage'
import type { Metadata } from 'next'

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
  return {
    title: `Journal — ${date} — Kochie Engineering`,
    description: entry.body.slice(0, 160),
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
      (e) =>
        e.slug !== entry.slug &&
        e.tags.some((t) => entry.tags.includes(t))
    )
    .slice(0, 3)

  return (
    <main className="bg-bg text-text">
      <JournalEntryPage entry={entry} related={related} />
    </main>
  )
}
