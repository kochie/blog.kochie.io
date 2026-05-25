'use client'

import React, { useEffect, useState } from 'react'

/**
 * Hairline progress bar pinned to the top of the viewport. Fills from 0% to
 * 100% as the document scrolls. The gradient runs from `accent` (clay) to
 * `signal` (signal yellow) so the visual cue rolls warmer as the reader
 * approaches the bottom.
 */
const ScrollProgress = (): React.ReactElement => {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? window.scrollY / max : 0
      setPercent(Math.min(100, Math.max(0, ratio * 100)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
    >
      <div
        data-scroll-progress
        className="h-full bg-gradient-to-r from-accent to-signal transition-[width] duration-100 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ScrollProgress
