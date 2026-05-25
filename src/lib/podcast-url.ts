import type { PodcastMetadata } from './article-path'

// Direct audio file pattern. Anything matching this is already the MP3 we
// want — pass it through without a fetch.
const AUDIO_FILE_RE = /\.(mp3|m4a|wav)(?:\?|$)/i

// Beehiiv hosts every episode at this canonical pattern. Both the public
// episode page and the show's RSS feed embed it verbatim, so a single regex
// covers both. (Pattern: /<publication-id>/<show-id>/<episode-id>/<file-id>.mp3)
const BEEHIIV_AUDIO_RE =
  /https:\/\/podcasts\.beehiiv\.com\/[a-f0-9-]+\/[a-f0-9-]+\/[a-f0-9-]+\/[a-f0-9-]+\.mp3/i

// Generic RSS/Atom audio enclosure. The <enclosure url="…"> tag is the
// canonical way podcasts expose audio files in their feeds.
const ENCLOSURE_RE = /<enclosure[^>]+url="([^"]+\.(?:mp3|m4a|wav)[^"]*)"/i

// Fallback: an HTML page with a plain <audio> or <source> tag.
const HTML_AUDIO_RE =
  /<(?:audio|source)[^>]+src="([^"]+\.(?:mp3|m4a|wav)[^"]*)"/i

/**
 * Turn a podcast frontmatter URL into a direct audio file URL.
 *
 * Accepts any of:
 * - A direct `*.mp3` URL — passes through.
 * - A beehiiv episode page (e.g. `https://kochie.beehiiv.com/podcast/s/<show>/<slug>`).
 * - A podcast RSS feed URL where the latest item's enclosure should be used.
 * - Any HTML page that contains an `<audio>` / `<source>` tag.
 *
 * Caches the fetch via Next's `force-cache` so repeat builds don't re-hit the
 * network — beehiiv's URLs are content-addressed by UUID and never change.
 */
export async function resolveAudioUrl(url: string): Promise<string> {
  if (AUDIO_FILE_RE.test(url)) return url

  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${url} for podcast resolution: ${res.status} ${res.statusText}`
    )
  }
  const text = await res.text()

  // Beehiiv first — it's the most likely host for this site and the regex is
  // strict enough to avoid false positives in unrelated text.
  const beehiiv = text.match(BEEHIIV_AUDIO_RE)
  if (beehiiv) return beehiiv[0]

  const enclosure = text.match(ENCLOSURE_RE)
  if (enclosure) return enclosure[1]

  const audio = text.match(HTML_AUDIO_RE)
  if (audio) return audio[1]

  throw new Error(`Could not find an audio URL on ${url}`)
}

/**
 * Normalise a `podcast` frontmatter value and resolve its audio URL.
 *
 * Accepts any of:
 * - `podcast: <url>` — the simplest form.
 * - `podcast: { audio: <url>, duration?: "12:34" }` — explicit object.
 * - `podcast: { episode: <url>, duration?: "12:34" }` — alias for `audio`.
 *
 * Returns `undefined` (and warns) when the input is missing, malformed, or
 * the audio URL can't be resolved. The article still renders without a
 * player rather than failing the build over a podcast hosting hiccup.
 */
export async function resolvePodcast(
  raw: unknown
): Promise<PodcastMetadata | undefined> {
  if (raw === null || raw === undefined) return undefined

  let sourceUrl: string | undefined
  let duration: string | undefined

  if (typeof raw === 'string') {
    sourceUrl = raw
  } else if (typeof raw === 'object') {
    const r = raw as {
      audio?: unknown
      episode?: unknown
      duration?: unknown
    }
    if (typeof r.audio === 'string') sourceUrl = r.audio
    else if (typeof r.episode === 'string') sourceUrl = r.episode
    if (typeof r.duration === 'string') duration = r.duration
  }

  if (!sourceUrl) return undefined

  try {
    const audio = await resolveAudioUrl(sourceUrl)
    return { audio, duration }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[podcast] ${msg}`)
    return undefined
  }
}
