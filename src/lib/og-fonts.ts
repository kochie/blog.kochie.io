/**
 * Font loader for `next/og` image generation. Pulls Source Serif 4 and Geist
 * Mono — the two Field Journal type families — straight from Google Fonts at
 * runtime. The CSS API serves a different stylesheet per User-Agent, so we
 * pose as a recent browser to get the woff2 URL.
 *
 * Falls back to a network-error response is the caller's responsibility:
 * functions throw on miss so the OG route can decide how to surface it.
 */

const GFONTS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

interface LoadOpts {
  family: string
  /** Weight axis — 400, 500, 600, etc. */
  weight: number
  /** Italic axis — false for upright, true for italic. */
  italic?: boolean
}

/**
 * Resolve a Google Fonts family + weight + style to a raw woff2 binary that
 * `ImageResponse` can pass straight into Satori.
 */
export async function loadGoogleFont({
  family,
  weight,
  italic = false,
}: LoadOpts): Promise<ArrayBuffer> {
  const ital = italic ? '1' : '0'
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=` +
    `${encodeURIComponent(family)}:ital,wght@${ital},${weight}&display=swap`

  const css = await fetch(cssUrl, {
    headers: { 'User-Agent': GFONTS_UA },
    cache: 'force-cache',
  }).then((r) => r.text())

  // Google Fonts emits one @font-face block per subset (latin, latin-ext, …).
  // Any subset's binary contains the basic Latin glyphs we need for OG copy,
  // so the first match is fine.
  const match =
    css.match(/src:\s*url\((https?:[^)]+\.woff2)\)\s*format\('woff2'\)/) ??
    css.match(/src:\s*url\((https?:[^)]+)\)/)
  if (!match) {
    throw new Error(
      `Could not extract font URL for ${family} ${weight}${italic ? 'i' : ''}: ${css.slice(0, 300)}`
    )
  }

  const fontResponse = await fetch(match[1], { cache: 'force-cache' })
  if (!fontResponse.ok) {
    throw new Error(`Font fetch failed for ${match[1]}: ${fontResponse.status}`)
  }
  return await fontResponse.arrayBuffer()
}

/**
 * Convenience: load all the weights/styles the Field Journal OG template
 * needs in one parallel fetch. Returns the array shape `ImageResponse`
 * expects under its `fonts` option.
 */
export async function loadFieldJournalFonts() {
  const [serif600, serif400Italic, mono500] = await Promise.all([
    loadGoogleFont({ family: 'Source Serif 4', weight: 600 }),
    loadGoogleFont({ family: 'Source Serif 4', weight: 400, italic: true }),
    loadGoogleFont({ family: 'Geist Mono', weight: 500 }),
  ])
  return [
    {
      name: 'Source Serif 4',
      data: serif600,
      style: 'normal' as const,
      weight: 600 as const,
    },
    {
      name: 'Source Serif 4',
      data: serif400Italic,
      style: 'italic' as const,
      weight: 400 as const,
    },
    {
      name: 'Geist Mono',
      data: mono500,
      style: 'normal' as const,
      weight: 500 as const,
    },
  ]
}
