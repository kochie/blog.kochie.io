import { getEntries, getEntryBySlug } from '@/lib/journal-path'
import { journalEntryToMarkdown, MARKDOWN_HEADERS } from '@/lib/llms'

// Served at /journal/<entryId>.md via a rewrite in next.config.ts.
export const dynamicParams = false

export async function generateStaticParams() {
  const entries = await getEntries()
  return entries.map((e) => ({ entryId: e.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
): Promise<Response> {
  const { entryId } = await params
  const entry = await getEntryBySlug(entryId)
  if (!entry) return new Response('Not found', { status: 404 })

  return new Response(journalEntryToMarkdown(entry), {
    headers: MARKDOWN_HEADERS,
  })
}
