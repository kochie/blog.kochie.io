import React from 'react'

/**
 * Shared layout for every site OG image. Field Journal aesthetic — warm soot
 * background, mono kicker top-left, big serif headline, italic deck under,
 * mono meta line at the bottom, and a clay-accent stripe along the bottom
 * edge. Optional thumbnail collapses gracefully when absent.
 *
 * Built for Satori (next/og) — sticks to the inline-style subset Satori
 * supports: no CSS variables, no shorthand color names, every box has an
 * explicit `display`.
 */

// Field Journal palette — dark mode hexes are hard-coded here so the OG
// image renders the same regardless of where it's invoked from. Site chrome
// flips with `data-theme`, but OG cards live outside that context.
const COLOR = {
  bg: '#1A1815',
  bgDeep: '#14110E',
  text: '#F4EFE6',
  textMute: '#C9C0B0',
  textSoft: '#8C8576',
  accent: '#DA8665',
  signal: '#F2DC4A',
  rule: 'rgba(244, 239, 230, 0.12)',
} as const

export interface FieldJournalOGProps {
  /** Top-left mono kicker. Pass without the leading `//`. */
  kicker: string
  /** Optional accent fragment inside the kicker (e.g. an article number). */
  kickerAccent?: string
  /** Big serif title. Wraps to ~3 lines for long article titles. */
  title: string
  /** Optional italic deck under the title. */
  deck?: string
  /** Mono meta line at the bottom (author · date · read time). */
  meta?: string
  /** Optional absolute URL to a thumbnail. Renders blurred behind the text. */
  bgImage?: string
  /** Optional small badge sitting below the meta — e.g. "5 ESSAYS". */
  badge?: string
}

const LOGO = (
  // The blog mark — inlined so Satori doesn't have to fetch a public asset.
  <svg
    width="72"
    height="72"
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.938,17.891C26.891,15.939 30.057,15.94 32.009,17.892C34.963,20.847 39.154,25.04 42.108,27.994C43.046,28.932 43.572,30.204 43.572,31.53C43.572,32.856 43.045,34.128 42.107,35.065C35.534,41.637 22.095,55.072 22.095,55.072C20.219,56.947 17.676,58 15.025,58C10.781,58 4.8,58 4.8,58C3.255,58 2,56.745 2,55.2L2,44.966C2,42.313 3.054,39.769 4.93,37.894C4.93,37.894 18.366,24.462 24.938,17.891Z"
      fill="#C34406"
    />
    <path
      d="M55.2,58L27.238,58C26.834,58 26.469,57.756 26.314,57.383C26.16,57.009 26.245,56.579 26.531,56.293C32.235,50.59 50.59,32.241 56.293,26.54C56.579,26.254 57.009,26.168 57.383,26.323C57.756,26.478 58,26.843 58,27.247C58,34.434 58,55.2 58,55.2C58,56.745 56.746,58 55.2,58Z"
      fill="#741516"
    />
    <path
      d="M32.795,2C33.194,2 33.553,2.24 33.706,2.609C33.859,2.978 33.774,3.402 33.492,3.684C27.815,9.359 9.42,27.749 3.708,33.459C3.422,33.745 2.991,33.831 2.618,33.676C2.244,33.521 2,33.156 2,32.752C2,25.563 2,4.8 2,4.8C2,3.255 3.254,2 4.8,2L32.795,2Z"
      fill="#FDBB0D"
    />
    <path
      d="M36.96,12.943C36.022,12.006 35.495,10.734 35.496,9.408C35.496,8.082 36.023,6.81 36.961,5.872C37.513,5.32 37.905,4.928 37.905,4.928C39.781,3.053 42.324,2 44.975,2C49.219,2 55.2,2 55.2,2C56.746,2 58,3.255 58,4.8L58,15.034C58,17.687 56.946,20.231 55.07,22.106C55.07,22.106 54.68,22.496 54.13,23.046C52.177,24.999 49.011,24.998 47.059,23.045C44.105,20.091 39.914,15.898 36.96,12.943Z"
      fill="#C34406"
    />
  </svg>
)

export const OG_SIZE = { width: 1200, height: 630 } as const

export function FieldJournalOG({
  kicker,
  kickerAccent,
  title,
  deck,
  meta,
  bgImage,
  badge,
}: FieldJournalOGProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: COLOR.bg,
        color: COLOR.text,
        fontFamily: 'Source Serif 4',
        position: 'relative',
        padding: '64px 72px',
      }}
    >
      {/* Optional blurred background photograph. Sits at very low opacity
          so the text always wins. */}
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.18,
            filter: 'grayscale(40%) blur(2px)',
          }}
        />
      ) : null}

      {/* Top row — kicker on the left, logo top-right. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Geist Mono',
            fontSize: 24,
            letterSpacing: 1,
            color: COLOR.textSoft,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: COLOR.accent, marginRight: 12 }}>{'//'}</span>
          {kickerAccent ? (
            <span style={{ color: COLOR.accent, marginRight: 12 }}>
              {kickerAccent}
            </span>
          ) : null}
          <span>{kicker}</span>
        </div>
        <div style={{ display: 'flex' }}>{LOGO}</div>
      </div>

      {/* Spacer so the headline sits in the optical centre. */}
      <div style={{ display: 'flex', flexGrow: 1 }} />

      {/* Headline + deck. */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
        <h1
          style={{
            display: 'block',
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.05,
            color: COLOR.text,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {deck ? (
          <p
            style={{
              display: 'block',
              marginTop: 24,
              marginBottom: 0,
              fontFamily: 'Source Serif 4',
              fontStyle: 'italic',
              fontSize: 30,
              lineHeight: 1.3,
              color: COLOR.textMute,
              maxWidth: 950,
            }}
          >
            {deck}
          </p>
        ) : null}
      </div>

      {/* Spacer above the meta row. */}
      <div style={{ display: 'flex', flexGrow: 1 }} />

      {/* Meta line + optional badge. */}
      {(meta || badge) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            width: '100%',
            fontFamily: 'Geist Mono',
            fontSize: 22,
            letterSpacing: 1,
            color: COLOR.textSoft,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>{meta}</div>
          {badge ? (
            <div
              style={{
                display: 'flex',
                color: COLOR.accent,
              }}
            >
              {badge}
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom hairline accent. The 6px clay strip terminates the card and
          mirrors the scroll-progress bar at the top of every article. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          backgroundColor: COLOR.accent,
        }}
      />
    </div>
  )
}
