'use client'

import React, { useState, type ReactElement } from 'react'
import Link from 'next/link'
import KochieMark, { type MarkPhase } from '@/components/KochieLoader/mark'

const TopbarBrand = (): ReactElement => {
  const [phase, setPhase] = useState<MarkPhase>('idle')

  return (
    <Link
      href="/"
      // `min-w-0` lets the brand shrink instead of pushing the nav off
      // the right edge; `whitespace-nowrap` keeps the wordmark on one
      // line. On screens narrower than `sm` the wordmark hides and the
      // logo carries the lockup alone.
      className="group flex items-center gap-2 sm:gap-3 font-serif font-semibold text-text leading-none text-lg hover:text-accent transition-colors duration-fast min-w-0"
      aria-label="Kochie Engineering / Blog"
      onClick={() => setPhase((p) => (p === 'idle' ? 'out' : p))}
    >
      {/* Decorative — the brand text alongside it carries the accessible
          name. Opens slightly on hover; a click spins it away and back. */}
      <KochieMark
        className="h-8 w-8 shrink-0"
        phase={phase}
        onAnimationEnd={(e) => {
          // p4 has the longest delay, so it finishing ends the phase.
          if (!(e.target as Element).classList.contains('p4')) return
          setPhase((p) => (p === 'out' ? 'in' : 'idle'))
        }}
      />
      <span className="hidden sm:inline whitespace-nowrap">
        Kochie Engineering <span className="text-accent">/</span> Blog
      </span>
    </Link>
  )
}

export default TopbarBrand
