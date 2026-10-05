import { buildLlmsTxt, PLAIN_TEXT_HEADERS } from '@/lib/llms'

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  return new Response(await buildLlmsTxt(), { headers: PLAIN_TEXT_HEADERS })
}
