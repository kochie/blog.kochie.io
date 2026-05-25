export interface IngestImage {
  /** Pre-signed or publicly accessible URL to the image. May be empty string when contentBase64 is set. */
  url: string
  /** Suggested filename, e.g. 'photo-1.jpg'. */
  filename: string
  /** Raw base64 content. When present, the GitHub hook uses this directly instead of fetching the URL. */
  contentBase64?: string
}

export interface IngestPayload {
  /** Message text with trailing hashtags already stripped. */
  body: string
  /** Hashtags extracted from the message, normalised to lowercase. */
  tags: string[]
  /** ISO date string 'YYYY-MM-DD'. Defaults to today UTC. */
  date: string
  images: IngestImage[]
}

export interface TagExtractionResult {
  body: string
  tags: string[]
}

/**
 * Splits trailing hashtags from a message body.
 *
 * "Trailing" means a contiguous run of #word tokens at the very end of the
 * message (after all non-hashtag content). Mid-sentence hashtags are left in
 * the body unchanged.
 */
export function extractTags(raw: string): TagExtractionResult {
  const trimmed = raw.trim()
  if (!trimmed) return { body: '', tags: [] }

  // Split on whitespace, walk backwards collecting #word tokens.
  const tokens = trimmed.split(/\s+/)
  const hashtagPattern = /^#([a-zA-Z][a-zA-Z0-9]*)$/

  const tags: string[] = []
  let trailingCount = 0

  for (let i = tokens.length - 1; i >= 0; i--) {
    const match = hashtagPattern.exec(tokens[i])
    if (match) {
      tags.unshift(match[1].toLowerCase())
      trailingCount++
    } else {
      break
    }
  }

  // If ALL tokens are hashtags there is no body.
  if (trailingCount === tokens.length) return { body: '', tags }
  if (trailingCount === 0) return { body: trimmed, tags: [] }

  // Strip trailing hashtags from the *original* string to preserve internal
  // whitespace (including paragraph-separating newlines between body text).
  const trailingTokens = tokens.slice(tokens.length - trailingCount)
  const escapedTokens = trailingTokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const trailingRegex = new RegExp(`\\s+${escapedTokens.join('\\s+')}\\s*$`)
  const body = trimmed.replace(trailingRegex, '').trim()

  return { body, tags }
}

/** Returns today's date as 'YYYY-MM-DD' in UTC. */
export function todaySlug(): string {
  return new Date().toISOString().slice(0, 10)
}
