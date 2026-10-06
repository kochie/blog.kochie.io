'use client'

import React, { useEffect, useRef, useState, type ReactElement } from 'react'
import KochieLoader from '@/components/KochieLoader'

// KochieLoader draws on a -14 -14 88 88 viewBox (padding for the pieces to fly
// in from) while the static mark is 0 0 60 60, so scale and offset the loader
// to sit exactly where the static mark would.
const SCALE = 88 / 60
const OFFSET = 14 / 60

export interface LogoRevealProps {
  /** Rendered size of the mark itself, in px. */
  markSize: number
  label?: string
  spin?: boolean
  className?: string
}

/**
 * The K mark assembling itself the first time it scrolls into view. Space is
 * reserved up front so nothing shifts when the animation starts.
 */
const LogoReveal = ({
  markSize,
  label = 'Kochie Engineering logo',
  spin = false,
  className,
}: LogoRevealProps): ReactElement => {
  const ref = useRef<HTMLSpanElement>(null)
  // No IntersectionObserver (jsdom, ancient browsers): just show it.
  const [inView, setInView] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof IntersectionObserver === 'undefined'
  )

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={`relative inline-block shrink-0 ${className ?? ''}`}
      style={{ width: markSize, height: markSize }}
    >
      {/* Mounted only once in view (rather than toggling `visible`) so a
          StrictMode effect re-run can't trigger the exit animation. */}
      {inView && (
        <span
          aria-hidden
          className="absolute"
          style={{ top: -markSize * OFFSET, left: -markSize * OFFSET }}
        >
          <KochieLoader size={markSize * SCALE} spin={spin} label={label} />
        </span>
      )}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icons/blog-logo.svg"
          alt=""
          width={markSize}
          height={markSize}
        />
      </noscript>
    </span>
  )
}

export default LogoReveal
