// Proxy for react-tweet that normalises the X/Twitter syndication API response.
//
// The syndication API has started omitting empty entity arrays (user_mentions,
// urls, symbols) instead of returning []. react-tweet's enrichTweet() does an
// unchecked for...of over these fields and crashes when they are undefined.
// By normalising here we fix the crash without patching node_modules.
import { fetchTweet } from 'react-tweet/api'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
// Cache for 15 minutes — tweets don't change frequently, and this avoids
// hitting the syndication API on every page render.
export const revalidate = 900

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let result: Awaited<ReturnType<typeof fetchTweet>>
  try {
    result = await fetchTweet(id)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (result.notFound || result.tombstone) {
    return NextResponse.json({ data: null }, { status: 200 })
  }

  const tweet = result.data
  if (!tweet) {
    return NextResponse.json({ data: null }, { status: 200 })
  }

  // Normalise: ensure all entity arrays exist so enrichTweet()'s for...of
  // loops don't throw "n is not iterable" on tweets that omit empty arrays.
  if (tweet.entities) {
    tweet.entities.user_mentions = tweet.entities.user_mentions ?? []
    tweet.entities.urls = tweet.entities.urls ?? []
    tweet.entities.symbols = tweet.entities.symbols ?? []
    tweet.entities.hashtags = tweet.entities.hashtags ?? []
  }

  // The react-tweet SWR fetcher reads `json.data`.
  return NextResponse.json({ data: tweet })
}
