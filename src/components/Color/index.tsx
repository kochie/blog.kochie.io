'use client'

import React, { useState, type ReactElement } from 'react'
import clsx from 'clsx'

export interface ColorProps {
  /** A hex colour, with or without the leading `#`. Always rendered in
   *  uppercase regardless of input casing. */
  hex: string
  className?: string
}

const COPIED_DURATION_MS = 1000

const normaliseHex = (input: string): string => {
  const trimmed = input.trim()
  return trimmed.startsWith('#')
    ? `#${trimmed.slice(1).toUpperCase()}`
    : `#${trimmed.toUpperCase()}`
}

/**
 * Inline colour chip — a small splotch of the colour next to its hex code,
 * rendered as a button so a click copies the hex to the clipboard. Designed
 * to sit inline in body text, e.g. "orange `<Color hex="#C34406" />`,
 * red `<Color hex="#741516" />`".
 */
const Color = ({ hex, className }: ColorProps): ReactElement => {
  const normalised = normaliseHex(hex)
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(normalised)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_DURATION_MS)
    } catch {
      // Older browsers / non-secure contexts silently no-op rather than
      // blowing up — the hex is still visible on screen for hand-copy.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Copy ${normalised} to clipboard`}
      title={copied ? 'Copied' : `Copy ${normalised}`}
      className={clsx(
        'inline-flex items-baseline gap-1.5 align-baseline',
        'font-mono text-meta tracking-wide text-text',
        'cursor-pointer',
        'hover:text-accent',
        'transition-colors duration-fast',
        className
      )}
    >
      <span
        aria-hidden
        className="inline-block w-3 h-3 rounded-full self-center border border-rule"
        style={{ backgroundColor: normalised }}
      />
      <span>{copied ? 'COPIED' : normalised}</span>
    </button>
  )
}

export default Color
