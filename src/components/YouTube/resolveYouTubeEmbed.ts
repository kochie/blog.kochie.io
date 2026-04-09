export type ResolveYouTubeOptions = {
  id?: string
  src?: string
  nocookie?: boolean
}

export function resolveYouTubeEmbed(opts: ResolveYouTubeOptions): {
  embedUrl: string
  videoId: string
} {
  let videoId = opts.id?.trim() ?? ''
  let searchParams = new URLSearchParams()
  let inferredNocookie = false

  const raw = opts.src?.trim()
  if (raw) {
    let url: URL
    try {
      url = new URL(raw)
    } catch {
      throw new Error(`YouTube: invalid src URL: ${raw}`)
    }

    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtube-nocookie.com') {
      inferredNocookie = true
    }

    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? ''
      searchParams = url.searchParams
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/)
      if (embedMatch) {
        videoId = decodeURIComponent(embedMatch[1])
        searchParams = url.searchParams
      } else if (
        url.pathname === '/watch' ||
        url.pathname.startsWith('/watch')
      ) {
        const v = url.searchParams.get('v')
        if (v) videoId = v
        const next = new URLSearchParams(url.searchParams)
        next.delete('v')
        searchParams = next
      }
    }
  }

  if (!videoId) {
    throw new Error('YouTube: pass `id` or a valid YouTube `src` URL')
  }

  const nocookie = opts.nocookie === true || inferredNocookie

  const base = nocookie
    ? 'https://www.youtube-nocookie.com/embed/'
    : 'https://www.youtube.com/embed/'
  const qs = searchParams.toString()
  const embedUrl = qs ? `${base}${videoId}?${qs}` : `${base}${videoId}`

  return { embedUrl, videoId }
}
