import { notFound } from 'next/navigation'
import { getEntries, getEntryBySlug, rehypeRewriteImagePaths } from '@/lib/journal-path'
import rehypeLqip from '@/lib/rehype-lqip-plugin'
import { JournalEntryPage } from '@/components/JournalEntryPage'
import type { Metadata } from 'next'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import { components } from '@/components/MDXWrapper/components'

const rehypeJournalLqip = rehypeLqip({
  fsDir: 'public/images/journal',
  publicDir: '/images/journal',
})

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
    alternates: {
      canonical: `/journal/${entryId}`,
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

  // MDX's JSX parser rejects `<digit` sequences (e.g. `<4:00min/km`) because
  // tag names can't start with a digit. Escape them before compilation so
  // plain-markdown text patterns don't break the build.
  const mdxSafeBody = entry.body.replace(/<(\d)/g, '&lt;$1')

  const code = String(
    await compile(mdxSafeBody, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeJournalLqip,
        rehypeRewriteImagePaths,
      ],
    })
  )
  const { default: MDXContent } = await run(code, {
    ...(runtime as any),
    baseUrl: import.meta.url,
  })

  return (
    <main className="bg-bg text-text">
      <JournalEntryPage entry={entry} related={related}>
        <MDXContent components={components} />
      </JournalEntryPage>
    </main>
  )
}
