import { getAllArticlesMetadata } from '@/lib/article-path'
import { articleToMarkdown, MARKDOWN_HEADERS } from '@/lib/llms'

// Served at /articles/<articleId>.md via a rewrite in next.config.ts.
export const dynamicParams = false

export async function generateStaticParams() {
  const articles = await getAllArticlesMetadata()
  return articles.map((a) => ({ articleId: a.articleDir }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ articleId: string }> }
): Promise<Response> {
  const { articleId } = await params
  const article = (await getAllArticlesMetadata()).find(
    (a) => a.articleDir === articleId
  )
  if (!article) return new Response('Not found', { status: 404 })

  return new Response(await articleToMarkdown(article), {
    headers: MARKDOWN_HEADERS,
  })
}
